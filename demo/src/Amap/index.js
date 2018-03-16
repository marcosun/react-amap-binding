/**
 * @module Demo/Post
 */
import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import Polyline from 'amap-plugin-canvas-polyline';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

@withStyles(styles)
/**
 * Export a form call api with post method
 */
export default class Amap extends React.Component {
  static propTypes = {
    classes: object,
  };

  /**
   * Contstructor function
   * @param {Object} props - Props
   */
  constructor(props) {
    super(props);
    this.props = props;

    this.initMap();
  }

  /**
   * initialise and show AMap
   */
  async initMap() {
    await this.importAMap();

    const map = new window.AMap.Map(this.mapContainer, {
      center: [120.12, 30.16],
    });

    const polyline = new Polyline();
  }

  /**
   * Create script tag to load AMap
   * @return {Promise} - AMap script tag load promise
   */
  importAMap() {
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = `http://webapi.amap.com/maps?v=1.4.4&key=1c6d063dfdc5b14d79150a156b625664`;

    document.body.appendChild(scriptTag);

    return new Promise((resolve) => {
      scriptTag.onload = () => {
        return resolve();
      };
    });
  }

  /**
   * Render a form sending post data
   * @return {Component}
   */
  render() {
    const {
      classes,
    } = this.props;

    return (
      <div className={classes.mapContainer}
        ref={(self) => {
        this.mapContainer = self;
        }}>
      </div>
    );
  }
}
