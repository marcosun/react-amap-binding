/**
 * @module Demo/MarkerPage
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
 * Marker page
 */
export default class MarkerPage extends React.Component {
  static propTypes = {
    classes: object,
  };

  /**
   * Click handler.
   * @param {Object} e - Event
   */
  handleClick(e) {
    alert('You have clicked a marker icon');
  }

  /**
   * Show MarkerPage with full screen width and height
   * @return {Component} - Page
   */
  render() {
    const {
      classes,
    } = this.props;

    return (
      <div className={classes.mapContainer}>
        <AMap>
          <Marker position={[120.162692, 30.253647]} onClick={this.handleClick.bind(this)} />
          <Marker position={[120.163071, 30.254444]} />
        </AMap>
      </div>
    );
  }
}
