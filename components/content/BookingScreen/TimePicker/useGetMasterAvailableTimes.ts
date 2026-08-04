import {useMemo} from 'react';
import {useAppSelector} from '@/state/hooks';
import dayjs from 'dayjs';

/**
 * The `useGetMasterAvailableTimes` hook calculates and returns the available times for a specific day of the week based on the master's schedule.
 *
 * It processes the `master_schedule` attribute of the selected master to determine:
 * - The list of available hours (`times`) for the given `dayOfWeek`.
 *
 * If no schedule is found for the specified day or the master is not selected, it defaults to a predefined list of hours (10 AM to 9 PM).
 *
 * @param {Props} params - The input parameters for the hook.
 * @param {number} params.dayOfWeek - The day of the week for which to retrieve available times.
 * @returns {{ times: number[] }} An object containing:
 *   - `times`: An array of numbers representing the available hours (e.g., [10, 11, 12, ..., 21]).
 *
 * @example
 * const { times } = useGetMasterAvailableTimes({ dayOfWeek: 1 }); // Monday
 * console.log(times); // [10, 11, 12, ..., 21]
 */
const useGetMasterAvailableTimes = ({
  dayOfWeek,
}: {
  dayOfWeek: number | null;
}): {times: number[]} => {
  /**
   * Default list of available hours if no specific schedule is found.
   * Represents hours from 10 AM to 9 PM.
   */
  const allTimes = Array.from({length: 12}, (_, i) => i + 10);

  /**
   * Getting master picked for order from redux state
   */
  const {master: selectedMaster} = useAppSelector(state => state.OrderReducer);

  const {times} = useMemo(() => {
    if (!selectedMaster || !dayOfWeek) {
      return {times: allTimes};
    }

    const intervals =
      selectedMaster?.attributeValues?.master_schedule?.value[0]?.values;

    if (!intervals?.length) {
      return {times: allTimes};
    }

    /**
     * Finds the interval corresponding to the specified day of the week.
     */
    const preTimes = intervals.find((interval: any) => {
      const targetDate = interval?.dates[0];

      if (targetDate) {
        const day = dayjs(targetDate);
        const currentDayOfWeek = day.day();
        if (dayOfWeek === currentDayOfWeek) {
          return interval;
        }
      }
    });

    /**
     * Extracts available times from the matched interval.
     * Defaults to `allTimes` if no times are defined for the day.
     */
    const times =
      preTimes?.times?.map((time: any) => {
        const hour = time[0]?.hours;
        return hour;
      }) || allTimes;

    return {times};
  }, [selectedMaster, dayOfWeek]);

  return {
    times,
  };
};

export default useGetMasterAvailableTimes;
