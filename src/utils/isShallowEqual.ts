export default function (objA: any, objB: any) {
  // Test case: Primitive types
  if (Object.is(objA, objB)) {
    return true;
  }

  // Test case: NaN
  if (Number.isNaN(objA) && Number.isNaN(objB)) {
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
  for (let i = 0; i < keysA.length; i += 1) {
    if (!objB.hasOwnProperty(keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}
