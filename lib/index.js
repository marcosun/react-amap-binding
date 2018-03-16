/**
 * High performance canvas polyline
 */
export default class Polyline {
  /**
   * Shallow copy to implement immutibility
   * @param  {Object} options - Polyline config properties
   */
  constructor(options) {
    this.options = {
      ...options,
      coords: options.coords, // Array of [lng, lat]. Required
      color: options.color && 'black', // String. Default to black
    };
  }
}
