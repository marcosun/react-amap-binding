import React from 'react';
import { hot } from 'react-hot-loader';
import { PathNavigator } from 'react-amap-binding';
import PathSimplifier from '../PathSimplifier';

@hot(module)
class PathNavigatorPage extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      pathIndex: 0,
    };
  }

  /**
   * Test PathNavigator.
   */
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        pathIndex: 1,
      });
    }, 10000);
  }

  /**
   * The callback is fired once the pathNavigator is created.
   * @param  {Object} map - AMap instance
   * @param  {Object} target - PathNavigator instance
   * @param  {Object} pathSimplifier - PathSimplifier instance
   */
  handleComplete(map, target, pathSimplifier) {
    target.start();
  }

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
