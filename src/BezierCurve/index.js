import React from 'react';
import PropTypes from 'prop-types';
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../utils/breakIfNotChildOfAMap';
import cloneDeep from '../utils/cloneDeep';
import createEventCallback from '../utils/createEventCallback';
import isShallowEqual from '../utils/isShallowEqual';

/**
 * Fields that need to be deep copied.
 * AMap LBS library mutates options. Deep copy those options before passing to AMap so that
 * props won't be mutated.
 */
const NEED_DEEP_COPY_FIELDS = ['path'];

/**
 * BezierCurve binding.
 * BezierCurve has the same options as AMap.BezierCurve unless highlighted below.
 * {@link https://lbs.amap.com/api/javascript-api/reference/overlay#BezierCurve}
 */
class BezierCurve extends React.Component {
  static propTypes = {
    /**
     * Show BezierCurve by default, you can toggle show or hide by changing visible.
     */
    visible: PropTypes.bool,
    /**
     * Event callback.
     * Signature:
     * (bezierCurve, ...event) => void
     * bezierCurve: AMap.BezierCurve instance.
     * event: AMap event.
     */
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
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

  static defaultProps = {
    visible: true,
  };

  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  /**
   * Parse AMap.BezierCurve options.
   * Filter out event callbacks, the remainings are bezierCurve options.
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

    return bezierCurveOptions;
  }

  /**
   * Define event name mapping relations of react binding bezierCurve and AMap.BezierCurve.
   * Initialise AMap.BezierCurve and bind events.
   * Fire complete action as soon as bezier curve has been created.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = this.props;

    const map = context;

    breakIfNotChildOfAMap('BezierCurve', map);

    this.bezierCurveOptions = BezierCurve.parseBezierCurveOptions(this.props);

    this.bezierCurve = this.initBezierCurve(map);

    this.bindEvents();

    typeof onComplete === 'function' && onComplete(this.bezierCurve);
  }

  /**
   * Update this.bezierCurve by calling AMap.BezierCurve methods.
   */
  shouldComponentUpdate(nextProps) {
    const nextBezierCurveOptions = BezierCurve.parseBezierCurveOptions(nextProps);

    const newBezierCurveOptions = cloneDeep(nextBezierCurveOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.bezierCurveOptions.visible, nextBezierCurveOptions.visible);
    /**
     * Instead of calling one API for a specific option change, AMap.BezierCurve exposes
     * a master method: setOptions, which will update every options with a single function call.
     */
    this.updateBezierCurveWithAPI('setOptions', this.bezierCurveOptions, nextBezierCurveOptions,
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
   * Bind all events on map instance, and save event listeners which will be removed in
   * componentWillUnmount lifecycle.
   */
  bindEvents() {
    this.AMapEventListeners = [];

    /**
     * Construct event callbacks.
     */
    const eventCallbacks = this.parseEvents();

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(this.bezierCurve, eventName, handler),
      );
    });
  }

  /**
   * Initialise AMap.BezierCurve.
   */
  initBezierCurve(map) {
    const { visible } = this.props;

    const newBezierCurveOptions = cloneDeep(this.bezierCurveOptions, NEED_DEEP_COPY_FIELDS);

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
   * Hide or show bezierCurve.
   */
  toggleVisible(previousProp, nextProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      if (nextProp === true) this.bezierCurve.show();
      if (nextProp === false) this.bezierCurve.hide();
    }
  }

  /**
   * Update AMap.BezierCurve instance with named API.
   * Won't call API if prop does not change.
   */
  updateBezierCurveWithAPI(apiName, previousProp, nextProp, newProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      this.bezierCurve[apiName](newProp);
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
