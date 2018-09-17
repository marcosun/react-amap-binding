import React from 'react';
import {
  bool,
  func,
  object,
} from 'prop-types';
import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import cloneDeep from '../Util/cloneDeep';
import createEventCallback from '../Util/createEventCallback';
import isShallowEqual from '../Util/isShallowEqual';

const NEED_DEEP_COPY_FIELDS = ['path'];

/**
 * BezierCurve binding
 * @param {BezierCurveOptions} props - Properties defined in AMap.BezierCurve.
 * BezierCurve has the same config options as AMap.BezierCurve unless highlighted below.
 * {@link https://lbs.amap.com/api/javascript-api/reference/overlay#BezierCurve}
 * Shows BezierCurve by default, you can toggle show or hide by setting visible.
 * @param {Object} props.map - AMap map instance
 * @param {Boolean} props.visible - Toggle visibility
 * @param {Function} props.onComplete - Complete callBack
 * @param {Function} props.onClick - Click callback
 * @param {Function} props.onDblClick - Double click callback
 * @param {Function} props.onRightClick - Right click callback
 * @param {Function} props.onHide - Hide bezierCurve callback
 * @param {Function} props.onShow - Show bezierCurve callback
 * @param {Function} props.onMouseDown - Mouse down callback
 * @param {Function} props.onMouseUp - Mouse up callback
 * @param {Function} props.onMouseOver - Mouse over callback
 * @param {Function} props.onMouseOut - Mouse out callback
 * @param {Function} props.onChange - Change callback
 * @param {Function} props.onTouchStart - Touch start callback
 * @param {Function} props.onTouchEnd - Touch end callback
 */
class BezierCurve extends React.Component {
  static propTypes = {
    map: object,
    visible: bool,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
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
    onTouchEnd: func,
    /* eslint-enable */
  };

  /**
   * Define event name mapping relations of react binding bezierCurve
   * and AMap.BezierCurve.
   * Initialise AMap.BezierCurve and bind events.
   * Binding onComplete event on bezierCurve instance
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
      onComplete,
    } = props;

    breakIfNotChildOfAMap('BezierCurve', map);

    this.bezierCurveOptions = this.parseBezierCurveOptions(this.props);

    this.bezierCurve = this.initBezierCurve(this.bezierCurveOptions);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.bezierCurve, this.eventCallbacks);

    onComplete && onComplete(map, this.bezierCurve);
  }

  /**
   * Update this.bezierCurve by calling AMap.BezierCurve methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const nextBezierCurveOptions = this.parseBezierCurveOptions(nextProps);

    const newBezierCurveOptions = cloneDeep(nextBezierCurveOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.bezierCurveOptions.visible, nextBezierCurveOptions.visible);

    this.updateBezierCurveWithApi('setOptions', this.bezierCurveOptions, nextBezierCurveOptions, newBezierCurveOptions);

    this.bezierCurveOptions = nextBezierCurveOptions;

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy bezierCurve instance.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.bezierCurve.setMap(null);
    this.bezierCurve = null;
  }

   /**
   * Initialise AMap.BezierCurve
   * @param {Object} bezierCurveOptions - AMap.BezierCurve options
   * @return {BezierCurve}
   */
  initBezierCurve(bezierCurveOptions) {
    const {
      map,
      visible,
    } = this.props;

    const bezierCurve = new window.AMap.BezierCurve(cloneDeep(bezierCurveOptions, NEED_DEEP_COPY_FIELDS));

    bezierCurve.setMap(map);

    if (visible === false) bezierCurve.hide();

    return bezierCurve;
  }

  /**
   * Return an object of all supported event callbacks
   * @return {Object}
   */
  parseEvents() {
    return {
      onClick: createEventCallback('onClick', this.bezierCurve).bind(this),
      onDblClick: createEventCallback('onDblClick', this.bezierCurve).bind(this),
      onRightClick: createEventCallback('onRightClick', this.bezierCurve).bind(this),
      onHide: createEventCallback('onHide', this.bezierCurve).bind(this),
      onShow: createEventCallback('onShow', this.bezierCurve).bind(this),
      onMouseDown: createEventCallback('onMouseDown', this.bezierCurve).bind(this),
      onMouseUp: createEventCallback('onMouseUp', this.bezierCurve).bind(this),
      onMouseOver: createEventCallback('onMouseOver', this.bezierCurve).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.bezierCurve).bind(this),
      onChange: createEventCallback('onChange', this.bezierCurve).bind(this),
      onTouchStart: createEventCallback('onTouchStart', this.bezierCurve).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', this.bezierCurve).bind(this),
    };
  }

  /**
   * @param {Object} props
   * @return {Object}
   */
  parseBezierCurveOptions(props) {
    const {
      ...bezierCurveOptions
    } = props;

    return {
      ...bezierCurveOptions,
    };
  }

  /**
   * Bind all events on bezierCurve instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.BezierCurve} bezierCurve - AMap.BezierCurve instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(bezierCurve, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(bezierCurve, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.BezierCurve instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.BezierCurve instance update method name
   * @param  {*} currentProp - Current value
   * @param  {*} nextProp - Next value
   * @param  {*} newProp - New value
   */
  updateBezierCurveWithApi(apiName, currentProp, nextProp, newProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.bezierCurve[apiName](newProp);
    }
  }

  /**
   * Hide or show bezierCurve
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.bezierCurve.show();
      if (nextProp === false) this.bezierCurve.hide();
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

export default BezierCurve;
