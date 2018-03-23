import React from 'react';
import {
  object,
  func,
} from 'prop-types';
import _ from 'lodash';

import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import isShallowEqual from '../Util/isShallowEqual';

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
 * @param {Function} props.onDblClick - Double click callback
 * @param {Function} props.onRightClick - Right click callback
 * @param {Function} props.onMouseMove - Mouse move callback
 * @param {Function} props.onMouseOver - Mouse over callback
 * @param {Function} props.onMouseOut - Mouse out callback
 * @param {Function} props.onMouseDown - Mouse down callback
 * @param {Function} props.onMouseUp - Mouse up callback
 * @param {Function} props.onDragStart - Drag start callback
 * @param {Function} props.onDragging - Dragging callback
 * @param {Function} props.onDragEnd - onDrag end callback
 * @param {Function} props.onMoving - Moving callback
 * @param {Function} props.onMoveEnd - Move end callback
 * @param {Function} props.onMoveAlong - Move along callback
 * @param {Function} props.onTouchStart - Touch start callback
 * @param {Function} props.onTouchMove - Touch move callback
 * @param {Function} props.onTouchEnd - Touch end callback
 */
class Marker extends React.Component {
  static propTypes = {
    map: object,
    onClick: func,
    onDblClick: func,
    onRightClick: func,
    onMouseMove: func,
    onMouseOver: func,
    onMouseOut: func,
    onMouseDown: func,
    onMouseUp: func,
    onDragStart: func,
    onDragging: func,
    onDragEnd: func,
    onMoving: func,
    onMoveEnd: func,
    onMoveAlong: func,
    onTouchStart: func,
    onTouchMove: func,
    onTouchEnd: func,
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

    this.parseProps();

    this.initMarker();

    this.bindEvents();
  }

  /**
   * Update this.marker by calling AMap.Marker methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    this.setPosition(this.props.position, nextProps.position);

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy marker instance.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.marker.setMap(null);
    this.marker = null;
  }

  /**
   * Parse event callbacks and marker options
   * Named properties are event callbacks.
   * All other properties are marker options.
   */
  parseProps() {
    const {
      onClick,
      onDblClick,
      onRightClick,
      onMouseMove,
      onMouseOver,
      onMouseOut,
      onMouseDown,
      onMouseUp,
      onDragStart,
      onDragging,
      onDragEnd,
      onMoving,
      onMoveEnd,
      onMoveAlong,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      ...markerOptions
    } = this.props;

    this.eventCallbacks = {
      onClick,
      onDblClick,
      onRightClick,
      onMouseMove,
      onMouseOver,
      onMouseOut,
      onMouseDown,
      onMouseUp,
      onDragStart,
      onDragging,
      onDragEnd,
      onMoving,
      onMoveEnd,
      onMoveAlong,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
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
      const eventName = key.substring(2).toLowerCase();
      const handler = this.eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(this.marker, eventName, handler)
      );
    });
  }

  /**
   * Update marker position
   * @param {Array} currentPosition
   * @param {Array} nextPostion
   */
  setPosition(currentPosition, nextPostion) {
    if (!isShallowEqual(currentPosition, nextPostion)) {
      this.marker.setPosition(nextPostion);
    }
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
