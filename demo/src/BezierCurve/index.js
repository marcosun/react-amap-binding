import React from 'react';
import { hot } from 'react-hot-loader';
import { BezierCurve } from 'react-amap-binding';
import AMap from '../AMapPage';

@hot(module)
class BezierCurvePage extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.path = [
      [[120.162692, 30.253647]],
      [[120.162881, 30.254444], [120.164071, 30.254444]],
    ];

    this.state = {
      strokeColor: 'red',
      strokeStyle: 'solid',
    };
  }

  /**
   * Test bezierCurve strokeColor and strokeStyle.
   */
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        ...this.state,
        strokeColor: 'green',
        strokeStyle: 'dashed',
      });
    }, 5000);
  }

  /**
   * Automatically scale the map to the appropriate level of view.
   * @param  {Object} map - Map instance
   * @param  {Object} bezierCurve - BezierCurve instance
   */
  handleComplete = (map, bezierCurve) => {
    map.setFitView();
  }

  render() {
    return (
      <AMap>
        <BezierCurve
          onComplete={this.handleComplete}
          path={this.path}
          {...this.state}
        />
      </AMap>
    );
  }
}

export default BezierCurvePage;

