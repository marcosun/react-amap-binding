/**
 * @module Demo/TileLayerTraffic
 */
import React from 'react';
import {} from 'prop-types';
import {hot} from 'react-hot-loader';
import {TileLayerTraffic} from 'react-amap-binding';

import AMap from '../AMapPage';

/**
 * Traffic page
 */
@hot(module)
class Traffic extends React.Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * Show TileLayerTraffic with full screen width and height
   * @return {Component} - Page
   */
  render() {
    return (
      <AMap>
        <TileLayerTraffic
          autoRefresh={true}
        />
      </AMap>
    );
  }
}

export default Traffic;
