/**
 * @module Demo/InfoWindowPage
 */
import React from 'react';
import {} from 'prop-types';
import {hot} from 'react-hot-loader';
import {InfoWindow} from 'react-amap-binding';

import AMap from '../AMapPage';

/**
 * InfoWindowPage page
 */
@hot(module)
export default class InfoWindowPage extends React.Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      infoWindow: {
        isCustom: false,
        position: [120.162692, 30.253647],
        content: '<div>InfoWindow<br>InfoWindow</div>',
        autoMove: true,
        offset: [0, 0],
        visible: true,
        size: [500, 100],
      },
    };
  }

  /**
   * Click handler.
   * @param {Object} e - Event
   */
  handleClick = (e) => {
    alert('是否要关闭视窗？');
  }

  /**
   * Show InfoWindowPage with full screen width and height
   * @return {Component} - Page
   */
  render() {
    const {
      infoWindow,
    } = this.state;

    return (
      <AMap>
        <InfoWindow
          {...infoWindow}
          onClose={this.handleClick}
        />
      </AMap>
    );
  }
}

