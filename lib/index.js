/**
 * React AMap Binding Library
 */
import React from 'react';
import {
  string,
  oneOf,
} from 'prop-types';

/**
 * AMap wrapper component to initialise AMap
 * All map components should be direct childrens of this wrapper component
 */
export default class AMap extends React.Component {
  static propTypes = {
    protocol: oneOf(['http', 'https']), // Protocol, whether it is http or https
    version: string, // AMap javascript library version
    appKey: string.isRequired, // AMap JS App key
    // Pass through all other options that are defined in AMap.Map
    // http://lbs.amap.com/api/javascript-api/reference/map
  };

  static defaultProps = {
    protocol: 'http',
    version: '1.4.4',
  };

  /**
   * Initialise AMap wrapper component on div element defined in render function
   */
  componentDidMount() {
    this.initMap();
  }

  /**
   * Load AMap library and instantiate AMap by calling AMap.Map
   */
  async initMap() {
    const {
      protocol,
      version,
      appKey,
      ...otherOptions
    } = this.props;

    if (window.AMap === void 0) {
      await this.loadAMap({protocol, version, appKey});
    }

    this.map = new window.AMap.Map(this.mapContainer, otherOptions);
  }

  /**
   * Create script tag to load AMap
   * @param  {string} options.protocol - Protocol, whether it is http or https
   * @param  {string} options.version  - AMap javascript library version
   * @param  {string} options.appKey      - AMap JS App key
   * @return {Promise}                 - AMap script tag load promise
   */
  loadAMap({protocol, version, appKey}) {
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = `${protocol}://webapi.amap.com/maps?v=${version}&key=${appKey}`;

    document.body.appendChild(scriptTag);

    return new Promise((resolve) => {
      scriptTag.onload = () => {
        return resolve();
      };
    });
  }

  /**
   * Render a div element as root of AMap
   * @return {Component}
   */
  render() {
    return (
      <div style={{width: '100%', height: '100%'}}
        ref={(self) => {
        this.mapContainer = self;
        }}>
      </div>
    );
  }
}
