import React from 'react';
import {
  object,
  func,
} from 'prop-types';
import _ from 'lodash';

import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';

/**
 * Marker binding
 * @param  {MarkerOptions} props - Properties defined in AMap.Marker.
 * Marker has the same config options as AMap.Marker unless highlighted below.
 * Marker events usage please reference to AMap.Marker events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#marker}
 * Besides, it can transform an array of two numbers into AMap.Pixel instance.
 * @param {Object} props.map - AMap map instance
 * @param {Array|Pixel} props.offset - An array of two numbers or AMap.Pixel
 * @param {Function} props.onClick - Click callback
 */
class Marker extends React.PureComponent {
  static propTypes = {
    map: object,
    onClick: func,
  };

  /**
   * Define event name mapping relations of react binding Marker
   * and AMap.Marker.
   * Initialise AMap.Marker and bind events.
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
    } = props;

    breakIfNotChildOfAMap('Marker', map);

    this.eventNamesLookup = {
      onClick: 'click',
    };

    this.parseProps();

    this.initMarker();

    this.bindEvents();
  }

  /**
   * Remove event listeners.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.removeListener(listener);
    });
  }

  /**
   * Parse event callbacks and marker options
   * Named properties are event callbacks.
   * All other properties are marker options.
   */
  parseProps() {
    const {
      onClick,
      ...markerOptions
    } = this.props;

    this.eventCallbacks = {
      onClick,
    };

    // Filter out invalid callbacks
    this.eventCallbacks = _.pickBy(this.eventCallbacks, (callback) => {
      return typeof callback === 'function';
    });

    this.parseMarkerOptions(markerOptions);
  }

  /**
   * Parse marker options.
   * @param {Object} markerOptions - Marker options received on this.props
   * @param {Array|Pixel} markerOptions.offset - Transform an array of two
   * numbers into Pixel object
   */
  parseMarkerOptions(markerOptions) {
    const {
      offset,
    } = markerOptions;

    this.markerOptions = {
      ...markerOptions,
      offset: (() => {
        if (offset instanceof window.AMap.Pixel) {
          return offset;
        }

        if (offset instanceof Array) {
          return new window.AMap.Pixel(...offset);
        }

        return new window.AMap.Pixel(-10, -34);
      })(),
    };
  }

  /**
   * Instantiate Marker by calling AMap.Marker.
   */
  initMarker() {
    this.marker = new window.AMap.Marker(this.markerOptions);
  }

  /**
   * Bind all events on marker instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   */
  bindEvents() {
    this.AMapEventListeners = [];

    Object.keys(this.eventCallbacks).forEach((key) => {
      const eventName = this.eventNamesLookup[key];
      const handler = this.eventCallbacks[key];

      window.AMap.event.addListener(this.marker, eventName, (...params) => {
        handler(...params);
      });
    });
  }

  /**
   * Render nothing
   * @return {null}
   */
  render() {
    return null;
  }
}

export default Marker;
