/**
 * @module Demo/PathSimplifierPage
 */
import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import {PathSimplifier} from 'react-amap-binding';

import AMap from '../AMapPage';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

@withStyles(styles)
/**
 * PathSimplifier page
 */
export default class PathSimplifierPage extends React.Component {
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
          <PathSimplifier
            data={[{
              name: '轨迹0',
              path: [
                [120.432955, 30.234711],
                [120.183016, 30.243906],
                [120.163431, 30.254176],
              ],
            }]}
            getPath={(pathData, pathIndex) => {
              return pathData.path;
            }}
            getHoverTitle={() => {
              return null;
            }}
            autoSetFitView={false}
            clickToSelectPath={false}
            onPathClick={(e) => {
              console.log(e);
            }}
          />
        </AMap>
      </div>
    );
  }
}
