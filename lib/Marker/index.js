import React from 'react';
import {
  object,
} from 'prop-types';

/**
 * Marker binding
 * @param  {MarkerOptions} props - Properties defined in AMap.Marker
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#marker}
 * @param  {Object} props.map    - AMap map instance
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
      throw Error('Marker must be a child component of AMap');
    }

    this.initMarker();
  }

  /**
   * Instantiate Marker by calling AMap.Marker
   */
  initMarker() {
    this.marker = new window.AMap.Marker(this.props);
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
