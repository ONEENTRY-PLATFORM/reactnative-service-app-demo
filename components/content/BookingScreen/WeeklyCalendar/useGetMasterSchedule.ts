import {useMemo} from 'react';
import dayjs, {Dayjs} from 'dayjs';

type Props = {
  masterAttributes: any;
  displayedWeek: Dayjs;
};

const allAvailable = [1, 2, 3, 4, 5, 6, 7];

const isMatch = (currentDate: Dayjs, interval: any) => {
  const current = dayjs(currentDate);
  const intervalDate = dayjs(interval.dateISO);

  if (!interval.inEveryMonth) {
    if (current.month() !== intervalDate.month()) return false;
  }

  // Проверка года (если inEveryYear false)
  if (!interval.inEveryYear) {
    if (current.year() !== intervalDate.year()) return false;
  }

  if (interval.inEveryWeek) {
    if (current.day() !== intervalDate.day()) return false;
  } else {
    if (current.date() !== intervalDate.date()) return false;
  }

  return true;
};

const useGetMasterSchedule = ({masterAttributes, displayedWeek}: Props) => {
  const {available} = useMemo(() => {
    if (!masterAttributes) {
      return {available: allAvailable};
    }

    const intervals = masterAttributes?.master_schedule?.value[0]?.values;

    if (!intervals?.length) {
      return {available: allAvailable};
    }

    const available: Record<string, any> = {};
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = displayedWeek.add(i, 'day').clone();
      intervals.map((interval: any) => {
        const exceptions: any[] = interval.external;
        const excludeTimes: Record<any, any> = {};
        if (exceptions) {
          const result = exceptions?.some(exception => {
            const match = isMatch(dayOfWeek, {
              dateISO: exception.date,
              ...exception,
            });
            if (exception.times) {
              if (match) {
                excludeTimes[dayOfWeek.toISOString()] = exception.times.map(
                  (time: any) => time[0].hours,
                );
              }

              return false;
            } else {
              return match;
            }
          });

          if (result) return;
        }

        const [startDateStr, endDateStr] = interval?.dates || [];
        if (!startDateStr || !endDateStr) return [];
        const startDate = dayjs(startDateStr);
        const endDate = dayjs(endDateStr);
        const daysOfInterval = [];

        let currentDate = startDate;
        while (currentDate.isSame(endDate) || currentDate.isBefore(endDate)) {
          daysOfInterval.push(currentDate.toISOString());
          currentDate = currentDate.add(1, 'day');
        }

        daysOfInterval.map(day => {
          const match = isMatch(dayOfWeek, {dateISO: day, ...interval});
          if (match) {
            const excludedTimes = excludeTimes[dayOfWeek.toISOString()];
            if (excludedTimes) {
              available[dayOfWeek.toISOString()] = interval.times.filter(
                (time: any) => {
                  return !excludedTimes.includes(time[0].hours);
                },
              );
              return;
            }
            available[dayOfWeek.toISOString()] = interval.times;
          }
        });
      });
    }

    return {available};
  }, [masterAttributes, displayedWeek]);

  return {
    available,
  };
};

export default useGetMasterSchedule;
