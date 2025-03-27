/**
 * @module RemoveNulls
 */

export type ObjectT = Record<string, string | undefined | null | number>;

/**
 * Remove all falsy keys(null/undefined).
 *
 * @returns {object} - Keys with values.
 */
export function removeNulls(obj: ObjectT): Partial<ObjectT> {
  const nonNullableObject: Partial<ObjectT> = {};
  Object.keys(obj).forEach((instance) => {
    if (obj[instance] !== null && obj[instance] !== undefined) {
      nonNullableObject[instance] = obj[instance];
    }
  });
  return nonNullableObject;
}

/**
 * Stringifies all values.
 *
 * @returns {object} - Keys with stringified values.
 */
export function stringifyValues(obj: Partial<ObjectT>): Record<string, string> {
  const stringifiedObject: Record<string, string> = {};
  Object.keys(obj).forEach((instance) => {
    stringifiedObject[instance] = String(obj[instance]);
  });

  return stringifiedObject;
}

/**
 * Takes param object, strips off falsy values and convert values to strings.
 *
 * @returns {object} - Keys with stringified values.
 */
export function cleanParams(obj: ObjectT): Record<string, string> {
  return stringifyValues(removeNulls(obj));
}
