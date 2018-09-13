/**
 * @module Demo/AMapPage
 */
import React from 'react';
import {
  node,
  object,
  string,
} from 'prop-types';
import {hot} from 'react-hot-loader';
import {withStyles} from '@material-ui/core/styles';
import {AMap} from 'react-amap-binding';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

/**
 * AMap page
 */
@hot(module)
@withStyles(styles)
export default class AMapPage extends React.Component {
  static propTypes = {
    appKey: string,
    classes: object,
    children: node,

  };

  static defaultProps = {
    appKey: '1c6d063dfdc5b14d79150a156b625664',
  };

  /**
   * Show AMap with full screen width and height
   * @return {Component} - Page
   */
  render() {
    const {
      classes,
      children,
      ...others
    } = this.props;

    return (
      <div className={classes.mapContainer}>
        <AMap
          {...others}
        >
          {children}
        </AMap>
      </div>
    );
  }
}
