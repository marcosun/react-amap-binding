import React from 'react';
import {} from 'prop-types';
import {hot} from 'react-hot-loader';
import {PathNavigator} from 'react-amap-binding';

import AMap from '../AMapPage';
import PathSimplifier from '../PathSimplifier';

/**
 * PathNavigatorPage
 */
@hot(module)
class PathNavigatorPage extends React.Component {
  /**
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      pathIndex: 0,
    };
  }

  /**
   * Test PathNavigator
   */
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        pathIndex: 1,
      });
    }, 10000);
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
    return (
      <PathSimplifier>
        <PathNavigator
          loop={true}
          onComplete={this.handleComplete.bind(this)}
          pathIndex={this.state.pathIndex}
        />
      </PathSimplifier>
    );
  }
}

export default PathNavigatorPage;
