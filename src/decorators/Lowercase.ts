
/**
 * Provides methods to converts a string to lowercase letters.
 */
export function LowerCase(): PropertyDecorator {
  return (target, propertyKey) =>  {
    let currentValue : string;
    Object.defineProperty(target, propertyKey, {
      set: (newValue: string) => {
        currentValue = newValue.toLowerCase();
      },
      get: () => currentValue,
    });
  };
}