import React from 'react';
import { func } from 'prop-types';
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../utils/breakIfNotChildOfAMap';
import cloneDeep from '../utils/cloneDeep';
import createEventCallback from '../utils/createEventCallback';
import isShallowEqual from '../utils/isShallowEqual';

/**
 * Fields that need to be deep copied.
 * The new value is given to update api to avoid overwriting the props.
 */
const NEED_DEEP_COPY_FIELDS = ['center'];

/**
 * Circle binding.
 * Circle has the same config options as AMap.Circle unless highlighted below.
 * For circle events usage please reference to AMap.Circle events paragraph.
 * {@link https://lbs.amap.com/api/javascript-api/reference/overlay#circle}
 */
class Circle extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map                  - AMap.Map instance
     * @param {AMap.Circle} Circle            - AMap.Circle
     * @param {Object} event                  - Circle event parameters
     */
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
    /* eslint-enable */
  };

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
   * Binding onComplete event on circle instance.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = props;

    const map = context;

    breakIfNotChildOfAMap('Circle', map);

    this.circleOptions = Circle.parseCircleOptions(this.props);

    this.circle = new window.AMap.Circle(
      cloneDeep(
        {
          ...this.circleOptions,
          map,
        },
        NEED_DEEP_COPY_FIELDS,
      ),
    );

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.circle, this.eventCallbacks);

    onComplete && onComplete(map, this.circle);
  }

  /**
   * Update this.circle by calling AMap.Circle methods.
   * @param  {Object} nextProps - Next props
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const nextCircleOptions = Circle.parseCircleOptions(nextProps);

    const newCircleOptions = cloneDeep(nextCircleOptions, NEED_DEEP_COPY_FIELDS);

    /* We will test if should use setOptions later */
    /* this.circle.setOptions(newCircleOptions); */

    /* SetzIndex、setCursor not provided in lbs docs */
    /* this.updateCircleWithApi('setzIndex', this.circleOptions.zIndex,
      nextCircleOptions.zIndex, newCircleOptions.zIndex); */
    /* this.updateCircleWithApi('setCursor', this.circleOptions.cursor,
      nextCircleOptions.cursor, newCircleOptions.cursor); */

    this.updateCircleWithApi('setCenter', this.circleOptions.center, nextCircleOptions.center,
      newCircleOptions.center);

    this.updateCircleWithApi('setRadius', this.circleOptions.radius, nextCircleOptions.radius,
      newCircleOptions.radius);

    this.updateCircleWithApi('setPosition', this.circleOptions.position, nextCircleOptions.position,
      newCircleOptions.position);

    this.toggleVisible(this.circleOptions.visible, nextCircleOptions.visible);

    this.updateCircleWithApi('setExtData', this.circleOptions.extData, nextCircleOptions.extData,
      newCircleOptions.extData);

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
   * Return an object of all supported event callbacks.
   */
  parseEvents() {
    return {
      onClick: createEventCallback('onClick', this.circle).bind(this),
      onDblClick: createEventCallback('onDblClick', this.circle).bind(this),
      onRightClick: createEventCallback('onRightClick', this.circle).bind(this),
      onMouseMove: createEventCallback('onMouseMove', this.circle).bind(this),
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
   * Bind all events on circle instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.Circle} circle - AMap.Circle instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(circle, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(circle, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.Circle instance with named api and given value.
   * Won't call api if the given value does not change.
   * The new value is given to update api to avoid overwriting the props.
   * @param  {string} apiName - AMap.Circle instance update method name
   * @param  {*} currentProp - Current value
   * @param  {*} nextProp - Next value
   * @param  {*} newProp - New value
   */
  updateCircleWithApi(apiName, currentProp, nextProp, newProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.circle[apiName](newProp);
    }
  }

  /**
   * Hide or show circle.
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.circle.show();
      if (nextProp === false) this.circle.hide();
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
