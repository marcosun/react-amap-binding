/**
 * Compare two numbers
 * @param  {[type]} objA [description]
 * @param  {[type]} objB [description]
 * @return {[type]}      [description]
 */
export default function(objA, objB) {
  // Test case: Primitive types
  if (Object.is(objA, objB)) {
    return true;
  }

  // Test case: NaN
  if (objA !== objA && objB !== objB) {
    return true;
  }

  // Exclude null variables, undefined and functions
  if (typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!objB.hasOwnProperty(keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}
