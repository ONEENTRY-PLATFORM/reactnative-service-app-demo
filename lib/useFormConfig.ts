import {useMemo} from 'react';
import * as yup from 'yup';
import {IAttributes} from 'oneentry/dist/base/utils';
import {buildYupValidator} from '@/lib/buildYupValidator';

function stripPrefix(key: string): string {
  return key.replace(/^[^.]*?_/, '');
}

export function useFormConfig<T extends string = string>(
  inputsConfig: IAttributes[] = [],
): {
  fields: Record<T, {type: string} & Record<string, any>>;
  initialValues: Record<T, any>;
  validationSchema: yup.ObjectSchema<Record<T, any>>;
} {
  return useMemo(() => {
    const initialValues = {} as Record<T, any>;
    const validationShape = {} as Record<T, yup.AnySchema>;
    const fields = {} as Record<
      T,
      {type: string; label: string; placeholder: string}
    >;

    for (const input of inputsConfig) {
      const {marker, type, additionalFields = [], validators} = input;

      const meta = additionalFields.reduce(
        (
          acc: Record<string, string>,
          {marker, value}: {marker: string; value: string},
        ) => {
          acc[marker] = value;
          return acc;
        },
        {} as Record<string, string>,
      );

      switch (input.type) {
        case 'timeInterval':
          const dateKey = `${marker}_date` as T;
          const timeKey = `${marker}_time` as T;

          // Разделяем и очищаем ключи
          const metaDate = Object.fromEntries(
            Object.entries(meta)
              .filter(([key]) => key.toLowerCase().includes('date'))
              .map(([key, value]) => [stripPrefix(key), value]),
          );

          const metaTime = Object.fromEntries(
            Object.entries(meta)
              .filter(([key]) => key.toLowerCase().includes('time'))
              .map(([key, value]) => [stripPrefix(key), value]),
          );

          if (Object.keys(metaTime).length !== 0) {
            initialValues[dateKey] = '';

            validationShape[dateKey] = buildYupValidator('date', validators);

            fields[dateKey] = {
              type: 'date',
              ...metaDate,
            };
          }

          if (Object.keys(metaTime).length !== 0) {
            initialValues[timeKey] = '';
            validationShape[timeKey] = buildYupValidator('time', validators);

            fields[timeKey] = {
              type: 'time',
              ...metaTime,
            };
          }

          break;
        default:
          initialValues[marker as T] = '';
          validationShape[marker as T] = buildYupValidator(type, validators);

          fields[marker as T] = {
            type,
            ...meta,
          };
          break;
      }
    }

    const validationSchema = yup
      .object()
      .shape(validationShape) as yup.ObjectSchema<Record<T, any>>;

    return {fields, initialValues, validationSchema};
  }, [inputsConfig]);
}
