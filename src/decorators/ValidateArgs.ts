import { validate } from 'class-validator';
import { ClassType, createMethodDecorator, ArgumentValidationError } from 'type-graphql';

// this example use `class-validator` however you can plug-in `joi` or any other lib]
export function ValidateArgs<T extends object>(Type: ClassType<T>) {
  return createMethodDecorator(async ({ args, info }, next) => {
    const instance = Object.assign(new Type(), args);
    const validationErrors = await validate(instance, {
      skipMissingProperties: false,
      forbidUnknownValues: true,
      whitelist: true,
    });
    if (validationErrors.length > 0) {
      throw new ArgumentValidationError(validationErrors);
    }
    return next();
  });
}
