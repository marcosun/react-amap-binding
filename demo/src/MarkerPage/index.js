/**
 * @module Demo/MarkerPage
 */
import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import {Marker} from 'react-amap-binding';

import AMap from '../AMapPage';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

@withStyles(styles)
/**
 * Marker page
 */
export default class MarkerPage extends React.Component {
  static propTypes = {
    classes: object,
  };

  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      markers: [{
        position: [120.162692, 30.253647],
      }, {
        position: [120.163071, 30.254444],
      }],
    };
  }

  /**
   * Test Marker component update functionalities
   */
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        ...this.state,
        markers: [
          {
            position: [120.161955, 30.253519],
          },
          ...this.state.markers[1],
        ],
      });
    }, 5000);
  }

  /**
   * Click handler.
   * @param {Object} map - AMap.Map instance
   * @param {Object} target - Marker component instance
   * @param {Object} e - Event
   */
  handleClick = (map, target, e) => {
    alert('You have clicked a marker icon');
  }

  /**
   * Show MarkerPage with full screen width and height
   * @return {Component} - Page
   */
  render() {
    const {
      classes,
    } = this.props;

    const {
      markers,
    } = this.state;

    return (
      <div className={classes.mapContainer}>
        <AMap>
          {
            markers.map((marker, index) => {
              return <Marker
                key={index}
                {...marker}
                onClick={this.handleClick}
              />;
            })
          }
        </AMap>
      </div>
    );
  }
}
