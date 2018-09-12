import cloneDeep from 'lodash/cloneDeep';

/**
 * Deep copy
 * The primitive value returns original value.
 * Reference values:
 * If options is array, deep copy all.
 * If options is object, the corresponding field will be copied in depth.
 * But if needCloneKeys is undefined, will all be copy.
 * @param  {node}  options
 * @param  {undefined|Array} needCloneKeys - Config the keys for the required copy fields
 * @return {node}
 */
export default function(options, needCloneKeys) {
  if (options === null) {
    return null;
  }

  if (typeof options !== 'object') {
    return options;
  }

  if (options instanceof Array) {
    return cloneDeep(options);
  }

  if (options instanceof Object) {
    if (needCloneKeys === void 0) {
      return cloneDeep(options);
    }

    return {
      ...options,
      ...needCloneKeys.reduce((result, key) => {
        return {
          ...result,
          [key]: cloneDeep(options[key]),
        };
      }, {}),
    };
  }
}
