import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import {PathNavigator} from 'react-amap-binding';

import AMap from '../AMapPage';
import PathSimplifier from '../PathSimplifier';

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

    this.state = {
      pathIndex: 1,
    };

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
   * Test PathNavigator
   */
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        pathIndex: 0,
      });
    }, 5000);
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
        <PathSimplifier>
          <PathNavigator
            loop={true}
            onComplete={this.handleComplete.bind(this)}
            pathIndex={this.state.pathIndex}
          />
        </PathSimplifier>
      </div>
    );
  }
}

export default PathNavigatorPage;
