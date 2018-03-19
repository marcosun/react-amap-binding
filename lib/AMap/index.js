import React from 'react';
import {
  string,
  node,
  oneOf,
} from 'prop-types';

/**
 * To prevent requiring AMap library for multiple times,
 * race to set isRequiringAMap.
 * @type {Boolean}
 */
let isRequiringAMap = false;

/**
 * AMap wrapper component to initialise AMap.
 * All map components should be childrens of this wrapper component.
 * AMap component accepts the following config properties to initialise AMap.
 * @param  {MapOptions} props - Properties defined in AMap.Map
 * {@link http://lbs.amap.com/api/javascript-api/reference/map}
 * @param  {string} props.protocol - Protocol, whether it is http or https
 * @param  {string} props.version - AMap javascript library version
 * @param  {string} props.appKey - AMap JS App key
 * @param  {string} props.children - Child components
 */
class AMap extends React.Component {
  static propTypes = {
    protocol: oneOf(['http', 'https']), // Protocol, whether it is http or https
    version: string, // AMap javascript library version
    appKey: string.isRequired, // AMap JS App key
    // Pass through all other options that are defined in AMap.Map
    // http://lbs.amap.com/api/javascript-api/reference/map
    children: node,
  };

  static defaultProps = {
    protocol: 'http',
    version: '1.4.4',
  };

  /**
   * Require AMap library as earlier as possible
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.initAMap();
  }

  /**
   * Never update
   * @return {boolean} - false
   */
  shouldComponentUpdate() {
    return false;
  }

  /**
   * Load AMap library when neccessary
   * and instantiate map object by calling AMap.Map
   */
  async initAMap() {
    const {
      protocol,
      version,
      appKey,
      ...mapOptions
    } = this.props;

    if (window.AMap === void 0 && isRequiringAMap === false) {
      isRequiringAMap = true;
      await this.requireAMap({protocol, version, appKey});
      isRequiringAMap = false;
    }

    this.map = new window.AMap.Map(this.mapContainer, mapOptions);
  }

  /**
   * Create script tag to require AMap library
   * @param  {string} options.protocol - Protocol, whether it is http or https
   * @param  {string} options.version  - AMap javascript library version
   * @param  {string} options.appKey   - AMap JS App key
   * @return {Promise}                 - Promise created by AMap script tag
   */
  requireAMap({protocol, version, appKey}) {
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
    const {
      children,
    } = this.props;

    return (
      <div style={{width: '100%', height: '100%'}}
        ref={(self) => {
        this.mapContainer = self;
        }}>
        {children}
      </div>
    );
  }
}

export default AMap;
