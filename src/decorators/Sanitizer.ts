import sanitizeHtml from 'sanitize-html';

/**
 * Provides methods to sanitize untrusted strings of HTML, Document and DocumentFragment objects.
 * After sanitization, unwanted elements or attributes are removed, and the returned objects can safely be inserted into a document's DOM.
 */
export function Sanitizer(opts: sanitizeHtml.IOptions): PropertyDecorator {
  return (target, propertyKey) =>  {
    let currentValue : string;
    Object.defineProperty(target, propertyKey, {
      set: (newValue) => {
        currentValue = sanitizeHtml(newValue, opts);
      },
      get: () => currentValue,
    });
  };
}
