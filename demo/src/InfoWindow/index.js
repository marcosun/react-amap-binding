/**
 * @module Demo/InfoWindowPage
 */
import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import {InfoWindow} from 'react-amap-binding';

import AMap from '../AMapPage';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

@withStyles(styles)
/**
 * InfoWindowPage page
 */
export default class InfoWindowPage extends React.Component {
  static propTypes = {
    classes: object,
  };

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
      classes,
    } = this.props;

    const {
      infoWindow,
    } = this.state;
    return (
      <div className={classes.mapContainer}>
        <AMap>
          <InfoWindow
            {...infoWindow}
            onClose={this.handleClick}
          />
        </AMap>
      </div>
    );
  }
}

