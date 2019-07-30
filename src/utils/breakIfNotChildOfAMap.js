/**
 * Throw error if a testing module is not a child component of AMap component
 * by testing global variable window.AMap and its created instance
 * @param  {string} moduleName - Name of the testing module
 * @param  {AMap.Map} mapObject - Instance of AMap.Map
 * @param  {string} parentModuleName='AMap' - Name of parent module
 */
export default function(moduleName, mapObject, parentModuleName = 'AMap') {
  if (window.AMap === void 0 || mapObject === void 0) {
    throw Error(`${moduleName} cannot be used as a standalone. ` +
      `${moduleName} must be a child component of ${parentModuleName}.`);
  }
}
