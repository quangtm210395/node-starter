import { ValidationOptions } from 'class-validator';
import { buildMessage, ValidateBy } from 'class-validator';

export const IS_OBJECTID = 'isObjectId';

/**
 * Checks if a string is eth address.
 * If given value is not a string, then it returns false.
 */
export function isObjectId(value: unknown): boolean {
  return typeof value === 'string' && new RegExp(/^[0-9a-fA-F]{24}$/).test(value);
}

/**
 * Checks if a string is eth address
 * If given value is not a string, then it returns false.
 */
export function IsObjectId(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_OBJECTID,
      validator: {
        validate: (value, args): boolean => isObjectId(value),
        defaultMessage: buildMessage(
          eachPrefix => eachPrefix + '$property must be an mongodb ObjectId',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
