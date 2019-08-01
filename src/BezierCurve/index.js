import React from 'react';
import PropTypes from 'prop-types';
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../utils/breakIfNotChildOfAMap';
import cloneDeep from '../utils/cloneDeep';
import createEventCallback from '../utils/createEventCallback';
import isShallowEqual from '../utils/isShallowEqual';

/**
 * Fields that need to be deep copied.
 * The new value is given to update api to avoid overwriting the props.
 */
const NEED_DEEP_COPY_FIELDS = ['path'];

/**
 * BezierCurve binding.
 * BezierCurve has the same config options as AMap.BezierCurve unless highlighted below.
 * {@link https://lbs.amap.com/api/javascript-api/reference/overlay#BezierCurve}
 */
class BezierCurve extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /**
     * Show BezierCurve by default, you can toggle show or hide by setting visible.
     */
    visible: PropTypes.bool,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map                  - AMap.Map instance
     * @param {AMap.BezierCurve} bezierCurve  - AMap.BezierCurve
     * @param {Object} event                  - BezierCurve event parameters
     */
    onComplete: PropTypes.func,
    onClick: PropTypes.func,
    onDblClick: PropTypes.func,
    onRightClick: PropTypes.func,
    onHide: PropTypes.func,
    onShow: PropTypes.func,
    onMouseDown: PropTypes.func,
    onMouseUp: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onChange: PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchEnd: PropTypes.func,
    /* eslint-enable */
  };

  /**
   * Parse AMap.BezierCurve options.
   * Named properties are event callbacks, other properties are bezierCurve options.
   */
  static parseBezierCurveOptions(props) {
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
      onTouchEnd,
      ...bezierCurveOptions
    } = props;

    return {
      ...bezierCurveOptions,
    };
  }

  /**
   * Define event name mapping relations of react binding bezierCurve and AMap.BezierCurve.
   * Initialise AMap.BezierCurve and bind events.
   * Binding onComplete event on bezierCurve instance.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = props;

    const map = context;

    breakIfNotChildOfAMap('BezierCurve', map);

    this.bezierCurveOptions = BezierCurve.parseBezierCurveOptions(this.props);

    this.bezierCurve = this.initBezierCurve(this.bezierCurveOptions, map);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.bezierCurve, this.eventCallbacks);

    onComplete && onComplete(map, this.bezierCurve);
  }

  /**
   * Update this.bezierCurve by calling AMap.BezierCurve methods.
   * @param  {Object} nextProps - Next props
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const nextBezierCurveOptions = BezierCurve.parseBezierCurveOptions(nextProps);

    const newBezierCurveOptions = cloneDeep(nextBezierCurveOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.bezierCurveOptions.visible, nextBezierCurveOptions.visible);

    this.updateBezierCurveWithApi('setOptions', this.bezierCurveOptions, nextBezierCurveOptions,
      newBezierCurveOptions);

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
   * Initialise AMap.BezierCurve.
   * @param {Object} bezierCurveOptions - AMap.BezierCurve options
   * @param {Object} map - Map instance
   * @return {BezierCurve} - BezierCurve instance
   */
  initBezierCurve(bezierCurveOptions, map) {
    const { visible } = this.props;

    const newBezierCurveOptions = cloneDeep(bezierCurveOptions, NEED_DEEP_COPY_FIELDS);

    const bezierCurve = new window.AMap.BezierCurve(newBezierCurveOptions);

    bezierCurve.setMap(map);

    if (visible === false) bezierCurve.hide();

    return bezierCurve;
  }

  /**
   * Return an object of all supported event callbacks.
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
   * Won't call api if the given value does not change.
   * The new value is given to update api to avoid overwriting the props.
   * @param  {string} apiName - AMap.BezierCurve instance update method name
   * @param  {*} currentProp - Current value
   * @param  {*} nextProp - Next value
   * @param  {*} newProp - New value.
   */
  updateBezierCurveWithApi(apiName, currentProp, nextProp, newProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.bezierCurve[apiName](newProp);
    }
  }

  /**
   * Hide or show bezierCurve.
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
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default BezierCurve;
