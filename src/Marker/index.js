import React from 'react';
import {
  object,
  func,
} from 'prop-types';
import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import cloneDeep from '../Util/cloneDeep';
import createEventCallback from '../Util/createEventCallback';
import isShallowEqual from '../Util/isShallowEqual';

const NEED_DEEP_COPY_FIELDS = ['position'];

/**
 * Marker binding
 * @param  {MarkerOptions} props - Properties defined in AMap.Marker.
 * Marker has the same config options as AMap.Marker unless highlighted below.
 * For marker events usage please reference to AMap.Marker events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#marker}
 * Besides, it can transform an array of two numbers into AMap.Pixel instance.
 * @param {Object} props.map - AMap map instance
 * @param {Array|Pixel} props.offset - An array of two numbers or AMap.Pixel
 * @param {Array|Pixel} props.label.offset - An array of two numbers or AMap.Pixel
 * @param {Function} props.onComplete - Complete callback
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
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    onComplete: func,
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
    /* eslint-enable */
  };

  /**
   * Parse AMap.Marker options
   * Named properties are event callbacks, other properties are marker options.
   * @param {Object} props
   * @return {Object}
   */
  static parseMarkerOptions(props) {
    const {
      onComplete,
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
    } = props;

    const {
      label: { offset: labelOffset } = {},
      offset,
    } = markerOptions;

    return {
      ...markerOptions,
      label: {
        ...markerOptions.label,
        offset: (() => {
          if (labelOffset instanceof window.AMap.Pixel) {
            return labelOffset;
          }

          if (labelOffset instanceof Array) {
            return new window.AMap.Pixel(...labelOffset);
          }

          return new window.AMap.Pixel(0, 0);
        })(),
      },
      // Will transform an array of two numbers into a Pixel instance
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
   * Define event name mapping relations of react binding Marker
   * and AMap.Marker.
   * Initialise AMap.Marker and bind events.
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
      onComplete,
    } = props;

    breakIfNotChildOfAMap('Marker', map);

    this.markerOptions = this.parseMarkerOptions(this.props);

    this.marker = new window.AMap.Marker(cloneDeep(this.markerOptions, NEED_DEEP_COPY_FIELDS));

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.marker, this.eventCallbacks);

    onComplete && onComplete(map, this.marker);
  }

  /**
   * Update this.marker by calling AMap.Marker methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const nextMarkerOptions = this.parseMarkerOptions(nextProps);

    const newMarkerOptions = cloneDeep(nextMarkerOptions, NEED_DEEP_COPY_FIELDS);

    this.updateMarkerWithApi('setOffset', this.markerOptions.offset, nextMarkerOptions.offset, newMarkerOptions.offset);

    this.updateMarkerWithApi('setAnimation', this.markerOptions.animation, nextMarkerOptions.animation, newMarkerOptions.animation);

    this.updateMarkerWithApi('setClickable', this.markerOptions.clickable, nextMarkerOptions.clickable, newMarkerOptions.clickable);

    this.updateMarkerWithApi('setPosition', this.markerOptions.position, nextMarkerOptions.position, newMarkerOptions.position);

    this.updateMarkerWithApi('setAngle', this.markerOptions.angle, nextMarkerOptions.angle, newMarkerOptions.angle);

    this.updateMarkerWithApi('setLabel', this.markerOptions.label, nextMarkerOptions.label, newMarkerOptions.label);

    this.updateMarkerWithApi('setzIndex', this.markerOptions.zIndex, nextMarkerOptions.zIndex, newMarkerOptions.zIndex);

    this.updateMarkerWithApi('setIcon', this.markerOptions.icon, nextMarkerOptions.icon, newMarkerOptions.icon);

    this.updateMarkerWithApi('setDraggable', this.markerOptions.draggable, nextMarkerOptions.draggable, newMarkerOptions.draggable);

    this.toggleVisible(this.markerOptions.visible, nextMarkerOptions.visible);

    this.updateMarkerWithApi('setCursor', this.markerOptions.cursor, nextMarkerOptions.cursor, newMarkerOptions.cursor);

    this.updateMarkerWithApi('setContent', this.markerOptions.content, nextMarkerOptions.content, newMarkerOptions.content);

    this.updateMarkerWithApi('setTitle', this.markerOptions.title, nextMarkerOptions.title, newMarkerOptions.title);

    this.updateMarkerWithApi('setShadow', this.markerOptions.shadow, nextMarkerOptions.shadow, newMarkerOptions.shadow);

    this.updateMarkerWithApi('setShape', this.markerOptions.shape, nextMarkerOptions.shape, newMarkerOptions.shape);

    this.updateMarkerWithApi('setExtData', this.markerOptions.extData, nextMarkerOptions.extData, newMarkerOptions.extData);

    this.markerOptions = nextMarkerOptions;

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
   * Return an object of all supported event callbacks
   * @return {Object}
   */
  parseEvents() {
    return {
      onClick: createEventCallback('onClick', this.marker).bind(this),
      onDblClick: createEventCallback('onDblClick', this.marker).bind(this),
      onRightClick: createEventCallback('onRightClick', this.marker).bind(this),
      onMouseMove: createEventCallback('onMouseMove', this.marker).bind(this),
      onMouseOver: createEventCallback('onMouseOver', this.marker).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.marker).bind(this),
      onMouseDown: createEventCallback('onMouseDown', this.marker).bind(this),
      onMouseUp: createEventCallback('onMouseUp', this.marker).bind(this),
      onDragStart: createEventCallback('onDragStart', this.marker).bind(this),
      onDragging: createEventCallback('onDragging', this.marker).bind(this),
      onDragEnd: createEventCallback('onDragEnd', this.marker).bind(this),
      onMoving: createEventCallback('onMoving', this.marker).bind(this),
      onMoveEnd: createEventCallback('onMoveEnd', this.marker).bind(this),
      onMoveAlong: createEventCallback('onMoveAlong', this.marker).bind(this),
      onTouchStart: createEventCallback('onTouchStart', this.marker).bind(this),
      onTouchMove: createEventCallback('onTouchMove', this.marker).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', this.marker).bind(this),
    };
  }

  /**
   * Bind all events on marker instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.Marker} marker - AMap.Marker instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(marker, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(marker, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.Marker instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.Marker instance update method name
   * @param  {*} currentProp - Current value
   * @param  {*} nextProp - Next value
   * @param  {*} newProp - New value
   */
  updateMarkerWithApi(apiName, currentProp, nextProp, newProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.marker[apiName](newProp);
    }
  }

  /**
   * Hide or show marker
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.marker.show();
      if (nextProp === false) this.marker.hide();
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
