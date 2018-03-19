/**
 * @module Demo/Post
 */
import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import AMap from 'amap-plugin-canvas-polyline';

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
export default class AMapPage extends React.Component {
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
        <AMap
          appKey='1c6d063dfdc5b14d79150a156b625664'
        />
      </div>
    );
  }
}
