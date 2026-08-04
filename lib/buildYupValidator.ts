import * as yup from 'yup';

export type ValidatorSpec = {
  requiredValidator?: { customErrorText?: string };
  emailInspectionValidator?: { customErrorText?: string };
  stringInspectionValidator?: {
    customErrorText?: string;
    stringMin?: string;
    stringMax?: string;
    stringLength?: string;
  };
  comparisonValidator?: {
    customErrorText?: string;
    operator?: string;
    compareAttribute?: string;
  };
};

export function buildYupValidator(
  type: string,
  validators: ValidatorSpec = {}
): yup.AnySchema {
  let schema: yup.AnySchema;

  switch (type) {
    case 'number':
      schema = yup.number();
      break;
    case 'boolean':
      schema = yup.boolean();
      break;
    case 'string':
    default:
      schema = yup.string();
      break;
  }

  const {
    requiredValidator,
    emailInspectionValidator,
    stringInspectionValidator,
    comparisonValidator,
  } = validators;

  if (requiredValidator) {
    schema = schema.required(requiredValidator.customErrorText || 'Required');
  }

  if (emailInspectionValidator) {
    schema = (schema as yup.StringSchema).email(
      emailInspectionValidator.customErrorText || 'Invalid email'
    );
  }

  if (comparisonValidator) {
    const { compareAttribute, customErrorText, operator } = comparisonValidator;

    schema = (schema as yup.StringSchema).oneOf([yup.ref(compareAttribute || '')], customErrorText || 'Passwords do not match');
  }

  if (stringInspectionValidator) {
    const {
      stringMin,
      stringMax,
      stringLength,
      customErrorText,
    } = stringInspectionValidator;

    const err = customErrorText ?? 'Invalid length';

    if (stringLength) {
      schema = (schema as yup.StringSchema).length(Number(stringLength), err);
    } else {
      if (stringMin) {
        schema = (schema as yup.StringSchema).min(Number(stringMin), err);
      }
      if (stringMax) {
        schema = (schema as yup.StringSchema).max(Number(stringMax), err);
      }
    }
  }

  return schema;
}
