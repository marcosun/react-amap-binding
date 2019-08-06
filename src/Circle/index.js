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
const NEED_DEEP_COPY_FIELDS = ['center'];

/**
 * Circle binding.
 * Circle has the same options as AMap.Circle unless highlighted below.
 * {@link https://lbs.amap.com/api/javascript-api/reference/overlay#circle}
 */
class Circle extends React.Component {
  static propTypes = {
    /**
     * Show Circle by default, you can toggle show or hide by changing visible.
     */
    visible: PropTypes.bool,
    /**
     * Event callback.
     * Signature:
     * (circle, ...event) => void
     * circle: AMap.Circle instance.
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
    onTouchMove: PropTypes.func,
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
   * Parse AMap.Circle options.
   * Named properties are event callbacks, other properties are circle options.
   */
  static parseCircleOptions(props) {
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
      ...circleOptions
    } = props;

    return circleOptions;
  }

  /**
   * Define event name mapping relations of react binding Circle and AMap.Circle.
   * Initialise AMap.Circle and bind events.
   * Fire complete action as soon as bezier curve has been created.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = this.props;

    const map = context;

    breakIfNotChildOfAMap('Circle', map);

    this.circleOptions = Circle.parseCircleOptions(this.props);

    this.circle = this.initCircle(map);

    this.bindEvents();

    typeof onComplete === 'function' && onComplete(map, this.circle);
  }

  /**
   * Update this.circle by calling AMap.Circle methods.
   */
  shouldComponentUpdate(nextProps) {
    const nextCircleOptions = Circle.parseCircleOptions(nextProps);

    const newCircleOptions = cloneDeep(nextCircleOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.circleOptions.visible, nextCircleOptions.visible);
    /**
     * Instead of calling one API for a specific option change, AMap.Circle exposes
     * a master method: setOptions, which will update every options with a single function call.
     */
    this.updateCircleWithAPI('setOptions', this.circleOptions, nextCircleOptions,
      newCircleOptions);

    this.circleOptions = nextCircleOptions;

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy circle instance.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.circle.setMap(null);
    this.circle = null;
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
        window.AMap.event.addListener(this.circle, eventName, handler),
      );
    });
  }

  /**
   * Initialise AMap.Circle.
   */
  initCircle(map) {
    const { visible } = this.props;

    const newCircleOptions = cloneDeep(this.circleOptions, NEED_DEEP_COPY_FIELDS);

    const circle = new window.AMap.Circle(newCircleOptions);

    circle.setMap(map);

    if (visible === false) circle.hide();

    return circle;
  }

  /**
   * Return an object of all supported event callbacks.
   */
  parseEvents() {
    return {
      onClick: createEventCallback('onClick', this.circle).bind(this),
      onDblClick: createEventCallback('onDblClick', this.circle).bind(this),
      onRightClick: createEventCallback('onRightClick', this.circle).bind(this),
      onHide: createEventCallback('onHide', this.circle).bind(this),
      onShow: createEventCallback('onShow', this.circle).bind(this),
      onMouseOver: createEventCallback('onMouseOver', this.circle).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.circle).bind(this),
      onMouseDown: createEventCallback('onMouseDown', this.circle).bind(this),
      onMouseUp: createEventCallback('onMouseUp', this.circle).bind(this),
      onChange: createEventCallback('onChange', this.circle).bind(this),
      onTouchStart: createEventCallback('onTouchStart', this.circle).bind(this),
      onTouchMove: createEventCallback('onTouchMove', this.circle).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', this.circle).bind(this),
    };
  }

  /**
   * Hide or show circle.
   */
  toggleVisible(previousProp, nextProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      if (nextProp === true) this.circle.show();
      if (nextProp === false) this.circle.hide();
    }
  }

  /**
   * Update AMap.Circle instance with named API.
   * Won't call API if prop does not change.
   */
  updateCircleWithAPI(apiName, previousProp, nextProp, newProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      this.circle[apiName](newProp);
    }
  }

  /**
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default Circle;
