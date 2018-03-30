/**
 * @module Demo/TileLayerTraffic
 */
import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import {TileLayerTraffic} from 'react-amap-binding';

import AMap from '../AMapPage';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

@withStyles(styles)
/**
 * Traffic page
 */
export default class Traffic extends React.Component {
  static propTypes = {
    classes: object,
  };

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
    const {
      classes,
    } = this.props;

    return (
      <div className={classes.mapContainer}>
        <AMap>
          <TileLayerTraffic
            autoRefresh={true}
          />
        </AMap>
      </div>
    );
  }
}
