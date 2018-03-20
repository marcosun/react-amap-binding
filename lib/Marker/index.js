import React from 'react';
import {
  object,
} from 'prop-types';

/**
 * Marker binding
 * @param  {MarkerOptions} props - Properties defined in AMap.Marker.
 * Marker has the same config options as AMap.Marker.
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#marker}
 * Besides, it can transform an array of two numbers into AMap.Pixel instance.
 * @param  {Object} props.map - AMap map instance
 * @param  {Array|Pixel} props.offset - An array of two numbers or AMap.Pixel
 */
class Marker extends React.PureComponent {
  static propTypes = {
    map: object,
  };

  /**
   * Instantiate Marker
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
    } = props;

    if (window.AMap === void 0 || map === void 0) {
      throw Error('Marker cannot be used as a standalone.\n'
        + 'Marker must be a child component of AMap.');
    }

    this.initMarkerOptions();

    this.initMarker();
  }

  /**
   * Initialise marker options.
   * Transform an array of two numbers into Pixel object for offset property
   * Accept offset
   */
  initMarkerOptions() {
    const {
      offset,
    } = this.props;

    this.markerOptions = {
      ...this.props,
      offset: (() => {
        if (offset instanceof window.AMap.Pixel) {
          return offset;
        }

        if (offset instanceof Array) {
          return new window.AMap.Pixel(...offset);
        }

        return new window.AMap.Pixel(-10, -34);
      })(),
    };
  }

  /**
   * Instantiate Marker by calling AMap.Marker
   */
  initMarker() {
    this.marker = new window.AMap.Marker(this.markerOptions);
  }

  /**
   * Render nothing
   * @return {null}
   */
  render() {
    return null;
  }
}

export default Marker;
