import React from 'react';
import {} from 'prop-types';
import {hot} from 'react-hot-loader';
import {BezierCurve} from 'react-amap-binding';

import AMap from '../AMapPage';

/**
 * BezierCurve page
 */
@hot(module)
export default class BezierCurvePage extends React.Component {
  static propTypes = {};

  /**
   * @param {Object} props
   */
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
   * Test bezierCurve strokeColor
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
   * Automatically scale the map to the appropriate level of view
   * @param  {Object} map
   * @param  {Object} bezierCurveInstance
   */
  handleComplete = (map, bezierCurveInstance) => {
    map.setFitView();
  }

  /**
   * @return {Element}
   */
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
