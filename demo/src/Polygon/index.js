/**
 * @module Demo/PolygonPage
 */
import React from 'react';
import {} from 'prop-types';
import {hot} from 'react-hot-loader';
import {Polygon} from 'react-amap-binding';

import AMap from '../AMapPage';

/**
 * Polygon page
 */
@hot(module)
export default class PolygonPage extends React.Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      polygons: [{
        path: [
          [119.616619, 30.109718],
          [119.855572, 30.13585],
          [119.786907, 29.930169],
        ],
      }, {
        path: [
          [
            [119.940716, 30.304355],
            [120.306011, 30.348214],
            [120.274426, 30.091896],
            [119.92561, 30.026524],
          ],
          [
            [120.076672, 30.255732],
            [120.219494, 30.261663],
            [120.167309, 30.173848],
            [120.053326, 30.160788],
          ],
        ],
      }],
    };
  }

  /**
   * Test polygon component update functionalities
   */
  componentDidMount() {
    // Delay 5s to hide a polygon and beautify style
    setTimeout(() => {
      this.setState({
        ...this.state,
        polygons: [{
          ...this.state.polygons[0],
          strokeColor: '#be7b0f',
          fillColor: '#be7b0f',
          fillOpacity: '0.5',
          visible: false,
        }, {
          ...this.state.polygons[1],
          path: [
            [119.940716, 30.304355],
            [120.306011, 30.348214],
            [120.274426, 30.091896],
            [119.92561, 30.026524],
          ],
          strokeColor: '#c73751',
          fillColor: '#c73751',
          fillOpacity: '0.5',
        }],
      });
    }, 5000);

    // Delay 10s to show that polygon
    setTimeout(() => {
      this.setState({
        ...this.state,
        polygons: [{
          ...this.state.polygons[0],
          visible: true,
        }, {
          ...this.state.polygons[1],
        }],
      });
    }, 10000);
  }

  /**
   * Click handler
   * @param {Object} map - AMap.Map instance
   * @param {Object} target - Polygon component instance
   * @param {Object} e - Event
   */
  handleClick = (map, target, e) => {
    alert('You have click a polygon');
  }

  /**
   * Hide polygon callback
   * @param {Object} map - AMap.Map instance
   * @param {Object} target - Polygon component instance
   * @param {Object} e - Event
   */
  handleHide = (map, target, e) => {
    alert('You have hide a polygon');
  }

  /**
   * Show PolygonPage with full screen width and height
   * @return {Component} - Page
   */
  render() {
    const {
      classes,
    } = this.props;

    return (
      <AMap>
        {
          this.state.polygons.map((polygon, index) => {
            return (
              <Polygon
                key={index}
                {...polygon}
                onHide={this.handleHide}
                onClick={this.handleClick}
              />
            );
          })
        }
      </AMap>
    );
  }
}
