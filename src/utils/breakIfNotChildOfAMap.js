/**
 * Throw error if a testing module is not a child component of AMap component
 * by testing the existence of global variable window.AMap and its created map instance.
 */
export default function(moduleName, mapObject, parentModuleName = 'AMap') {
  if (window.AMap === void 0 || mapObject === void 0) {
    throw Error(
      `${moduleName} cannot be used independently. ` +
      `${moduleName} must be a child component of ${parentModuleName}.`,
    );
  }
}
