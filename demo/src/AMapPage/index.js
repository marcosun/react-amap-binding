/**
 * @module Demo/Post
 */
import React from 'react';
import {
  object,
  node,
} from 'prop-types';
import {withStyles} from 'material-ui';
import {AMap} from 'react-amap-binding';

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
    children: node,
  };

  /**
   * Show AMap with full screen width and height
   * @return {Component} - Page
   */
  render() {
    const {
      classes,
      children,
    } = this.props;

    return (
      <div className={classes.mapContainer}>
        <AMap
          appKey='1c6d063dfdc5b14d79150a156b625664'
        >
          {children}
        </AMap>
      </div>
    );
  }
}
