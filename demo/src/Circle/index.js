/**
 * @module Demo/CirclePage
 */
import React from 'react';
import {hot} from 'react-hot-loader';
import { Circle } from 'react-amap-binding';
import AMap from '../AMapPage';

/**
 * Circle page
 */
@hot(module)
class CirclePage extends React.Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      circles: [{
        center: [120.162692, 30.253647],
      }, {
        center: [120.163071, 30.254444],
      }],
    };
  }

  /**
   * Test Circle component update functionalities
   */
  componentDidMount() {
  }

  /**
   * Click handler.
   * @param {Object} map - AMap.Map instance
   * @param {Object} target - Circle component instance
   * @param {Object} e - Event
   */
  handleClick = (map, target, e) => {
  }

  /**
   * Show CirclePage with full screen width and height
   * @return {Component} - Page
   */
  render() {
    const {
      circles,
    } = this.state;

    return (
      <AMap>
        {
          circles.map((circle, index) => {
            return <Circle
              key={index}
              {...circle}
              onClick={this.handleClick}
            />;
          })
        }
      </AMap>
    );
  }
}

export default CirclePage;

