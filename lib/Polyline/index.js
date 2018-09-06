import React from 'react';
import {
  object,
  bool,
  func,
} from 'prop-types';

import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import isShallowEqual from '../Util/isShallowEqual';
import createEventCallback from '../Util/createEventCallback';

/**
 * Polyline binding
 * Polyline has the same config options as AMap.Polyline unless highlighted below.
 * For Polyline events usage please reference to AMap.Polyline events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#polyline}
 * Shows Polyline by default, you can toggle show or hide by setting visible.
 * @param {Object} props.map - AMap map instance
 * @param {Boolean} props.visible - Toggle visibility
 * @param {Function} props.onComplete - Initialization complete callback
 * @param {Function} props.onClick - Click callback
 * @param {Function} props.onDblClick - Double click callback
 * @param {Function} props.onRightClick - Right click callback
 * @param {Function} props.onHide - Hide polyline callback
 * @param {Function} props.onShow - Show polyline callback
 * @param {Function} props.onMouseDown - Mouse down callback
 * @param {Function} props.onMouseUp - Mouse up callback
 * @param {Function} props.onMouseOver - Mouse over callback
 * @param {Function} props.onMouseOut - Mouse out callback
 * @param {Function} props.onChange - Change callback
 * @param {Function} props.onTouchStart - Touch start callback
 * @param {Function} props.onTouchMove - Touch move callback
 * @param {Function} props.onTouchEnd - Touch end callback
 */
class Polyline extends React.Component {
  static propTypes = {
    map: object,
    visible: bool,
    onComplete: func,
    onClick: func,
    onDblClick: func,
    onRightClick: func,
    onHide: func,
    onShow: func,
    onMouseDown: func,
    onMouseUp: func,
    onMouseOver: func,
    onMouseOut: func,
    onChange: func,
    onTouchStart: func,
    onTouchMove: func,
    onTouchEnd: func,
  };

  /**
   * Define event name mapping relations of react binding Polyline
   * and AMap.Polyline.
   * Initialise AMap.Polyline and bind events.
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
      onComplete,
    } = props;

    breakIfNotChildOfAMap('Polyline', map);

    this.polylineOptions = this.parsePolylineOptions(props);

    this.polyline = this.initPolyline(this.polylineOptions);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.polyline, this.eventCallbacks);

    onComplete && onComplete(map, this.polyline);
  }

  /**
   * Update this.polyline by calling AMap.Polyline methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const nextPolylineOptions = this.parsePolylineOptions(nextProps);

    this.updatePolylineWithApi('setOptions', this.polylineOptions, nextPolylineOptions);

    this.toggleVisible(this.polylineOptions.visible, nextPolylineOptions.visible);

    this.polylineOptions = nextPolylineOptions;

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy polyline instance.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.polyline.setMap(null);
    this.polyline = null;
  }

  /**
   * Initialise AMap polyline
   * @param {Object} polylineOptions - AMap.Polyline options
   * @return {Object}
   */
  initPolyline(polylineOptions) {
    const polyline = new window.AMap.Polyline(polylineOptions);

    if (this.visible === false) polyline.hide();

    return polyline;
  }

  /**
   * Return an object of all supported event callbacks
   * @return {Object}
   */
  parseEvents() {
    return {
      onClick: createEventCallback('onClick', this.polyline).bind(this),
      onDblClick: createEventCallback('onDblClick', this.polyline).bind(this),
      onRightClick: createEventCallback('onRightClick', this.polyline).bind(this),
      onHide: createEventCallback('onHide', this.polyline).bind(this),
      onShow: createEventCallback('onShow', this.polyline).bind(this),
      onMouseDown: createEventCallback('onMouseDown', this.polyline).bind(this),
      onMouseUp: createEventCallback('onMouseUp', this.polyline).bind(this),
      onMouseOver: createEventCallback('onMouseOver', this.polyline).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.polyline).bind(this),
      onChange: createEventCallback('onChange', this.polyline).bind(this),
      onTouchStart: createEventCallback('onTouchStart', this.polyline).bind(this),
      onTouchMove: createEventCallback('onTouchMove', this.polyline).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', this.polyline).bind(this),
    };
  }

  /**
   * Parse AMap.Polyline options
   * @param  {Object} props
   * @return {Object}
   */
  parsePolylineOptions(props) {
    const {
      onComplete,
      onClick,
      onDblClick,
      onRightClick,
      onHide,
      onShow,
      onMouseDown,
      onMouseUp,
      onMouseOver,
      onMouseOut,
      onChange,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      ...polylineOptions
    } = props;

    return {
      ...polylineOptions,
    };
  }

  /**
   * Bind all events on polyline instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.Polyline} polyline - AMap.Polyline instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(polyline, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(polyline, eventName, handler)
      );
    });
  }

  /**
   * Update AMap.Polyline instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.Polyline instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updatePolylineWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.polyline[apiName](nextProp);
    }
  }

  /**
   * Hide or show polyline
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.polyline.show();
      if (nextProp === false) this.polyline.hide();
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

export default Polyline;

