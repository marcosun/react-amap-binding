import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import {PathNavigator, PathSimplifier} from 'react-amap-binding';

import AMap from '../AMapPage';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

/**
 * PathNavigatorPage
 */
@withStyles(styles)
class PathNavigatorPage extends React.Component {
  static propTypes = {
    classes: object.isRequired,
  };

  /**
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.props = props;

    this.pathSimplifier = [{
      name: '轨迹0',
      path: [
        [120.432955, 30.234711],
        [120.183016, 30.243906],
        [120.163431, 30.254176],
      ],
    }, {
      name: '轨迹1',
      path: [
        [120.177591, 30.217746],
        [120.215529, 30.250078],
        [120.207117, 30.276618],
      ],
    }];
  }

  /**
   * @param  {Object} map - AMap instance
   * @param  {Object} target - Current instance
   * @param  {Object} pathSimplifier - PathSimplifier instance
   */
  handleComplete(map, target, pathSimplifier) {
    target.start();
  }

  /**
   * @return {Element}
   */
  render() {
    const {
      classes,
    } = this.props;

    return (
      <div className={classes.mapContainer}>
        <AMap>
          <PathSimplifier
            data={this.pathSimplifier}
            getPath={(pathData, pathIndex) => {
              return pathData.path;
            }}
            getHoverTitle={() => {
              return null;
            }}
            autoSetFitView={true}
            clickToSelectPath={false}
          >
            <PathNavigator
              loop={true}
              onComplete={this.handleComplete.bind(this)}
              pathIndex={0}
            />
          </PathSimplifier>
        </AMap>
      </div>
    );
  }
}

export default PathNavigatorPage;
