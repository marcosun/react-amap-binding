import React from 'react';
import { hot } from 'react-hot-loader';
import { Polyline } from 'react-amap-binding';
import AMap from '../AMapPage';

@hot(module)
class PolylinePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      path: [
        [120.171493, 30.263516],
        [120.172523, 30.239494],
        [120.172523, 30.239494],
        [120.170721, 30.233414],
        [120.170292, 30.228816],
        [120.170892, 30.223921],
        [120.171086, 30.221288],
        [120.173618, 30.21656],
        [120.185913, 30.197516],
        [120.187629, 30.193658],
        [120.188831, 30.181046],
        [120.188144, 30.165166],
      ],
      strokeWeight: 6,
      strokeColor: '#3366FF',
    };
  }

  /**
   * Mouse over handler.
   * @param {Object} map - AMap.Map instance
   * @param {Object} target - Polyline component instance
   * @param {Object} e - Event object
   */
  handleMouseOver = (map, polyline, e) => {
    this.setState({
      ...this.state,
      strokeColor: '#ff0c00',
    });
  }

  /**
   * Mouse out handler.
   * @param {Object} map - AMap.Map instance
   * @param {Object} target - Polyline component instance
   * @param {Object} e - Event
   */
  handleMouseOut = (map, polyline, e) => {
    this.setState({
      ...this.state,
      strokeColor: '#3366FF',
    });
  }

  render() {
    return (
      <AMap>
        <Polyline
          {...this.state}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
        />
      </AMap>
    );
  }
}

export default PolylinePage;
