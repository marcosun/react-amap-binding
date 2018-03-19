/**
 * @module Demo/Post
 */
import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import {Marker} from 'react-amap-binding';

import AMap from '../AMapPage';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

@withStyles(styles)
/**
 * AMap demo page
 */
export default class MarkerPage extends React.Component {
  static propTypes = {
    classes: object,
  };

  /**
   * Show AMap with full screen width and height
   * @return {Component} - Page
   */
  render() {
    const {
      classes,
    } = this.props;

    return (
      <div className={classes.mapContainer}>
        <AMap>
          <Marker />
        </AMap>
      </div>
    );
  }
}
