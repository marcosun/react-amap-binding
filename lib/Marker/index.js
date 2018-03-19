import React from 'react';

/**
 * Marker binding
 * @param  {MarkerOptions} props - Properties defined in AMap.Marker
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#marker}
 */
class Marker extends React.Component {
  /**
   * Hook lifecycle method to initialise Marker
   */
  componentDidMount() {
    if (window.AMap === void 0 || this.map === void 0) {
      throw Error('Marker must be a child component of AMap');
    }

    this.initMarker();
  }

  /**
   * Initialise Marker by calling AMap.Marker
   */
  initMarker() {
    this.marker = new window.AMap.Marker({
      ...this.props,
      map: this.map,
    });
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
