/**
 * @module Demo/MassMarksPage
 */
import React from 'react';
import {} from 'prop-types';
import {hot} from 'react-hot-loader';
import {MassMarks} from 'react-amap-binding';

import AMap from '../AMapPage';

/**
 * MassMarks page
 */
@hot(module)
class MassMarksPage extends React.Component {
  /**
   * Contstructor function
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      data: [{
        lnglat: [120.162692, 30.253647],
      }, {
        lnglat: [120.163071, 30.254444],
      }],
      style: {
        url: 'http://a.amap.com/jsapi_demos/static/images/mass0.png',
        anchor: [6, 6],
        size: [12, 12],
      },
    };
  }

  /**
   * Updata massMarks lnglat and style
   */
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        data: [{
          lnglat: [120.161955, 30.253519],
          style: 1,
        }, {
          ...this.state.data[1],
          style: 0,
        }],
        style: [{
          ...this.state.style,
          url: 'http://a.amap.com/jsapi_demos/static/images/mass1.png',
        }, {
          ...this.state.style,
        }],
      });
    }, 5000);
  }

  /**
   * Click handler.
   * @param {Object} map - AMap.Map instance
   * @param {Object} target - MassMarks component instance
   * @param {Object} e - Event
   */
  handleClick = (map, target, e) => {
    alert('You have clicked a massMarks icon');
  }

  /**
   * Render MassMarks page
   * @return {Component}
   */
  render() {
    return (
      <AMap>
        <MassMarks
          {...this.state}
          onClick={this.handleClick}
        />
      </AMap>
    );
  }
}

export default MassMarksPage;

