import React from 'react';
import { bool, func } from 'prop-types';
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
 * Polygon binding.
 * Polygon has the same config options as AMap.Polygon unless highlighted below.
 * For polygon events usage please reference to AMap.Polygon events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#polygon}
 */
class Polygon extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /**
     * Shows polygon by default, you can toggle show or hide by setting visible.
     */
    visible: bool,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map           - AMap.Map instance
     * @param {AMap.Polygon} polygon   - AMap.Polygon instance
     * @param {Object} event           - Polygon event parameters
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
   * Parse AMap.Polygon options.
   * Named properties are event callbacks, other properties are polygon options.
   */
  static parsePolygonOptions(props) {
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
      ...polygonOptions
    } = props;

    return {
      ...polygonOptions,
    };
  }

  /**
   * Define event name mapping relations of react binding Polygon and AMap.Polygon.
   * Initialise AMap.Polygon and bind events.
   * Binding onComplete event on polygon instance.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = props;

    const map = context;

    breakIfNotChildOfAMap('Polygon', map);

    this.polygonOptions = Polygon.parsePolygonOptions(props);

    this.polygon = this.initPolygon(this.polygonOptions, map);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.polygon, this.eventCallbacks);

    onComplete && onComplete(map, this.polygon);
  }

  /**
   * Update this.polygon by calling AMap.Polygon methods.
   * @param  {Object} nextProps
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const nextPolygonOptions = Polygon.parsePolygonOptions(nextProps);

    const newPolygonOptions = cloneDeep(nextPolygonOptions, NEED_DEEP_COPY_FIELDS);

    this.updatePolygonWithApi('setOptions', this.polygonOptions, nextPolygonOptions,
      newPolygonOptions);

    this.toggleVisible(this.polygonOptions.visible, nextPolygonOptions.visible);

    this.polygonOptions = nextPolygonOptions;

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy polygon instance.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.polygon.setMap(null);
    this.polygon = null;
  }

  /**
   * Initialise AMap polygon.
   * @param {Object} polygonOptions - AMap.Polygon options
   * @param {Object} map - Map instance
   * @return {Polygon}
   */
  initPolygon(polygonOptions, map) {
    const polygon = new window.AMap.Polygon(
      cloneDeep(
        {
          ...polygonOptions,
          map,
        },
        NEED_DEEP_COPY_FIELDS,
      ),
    );

    if (this.props.visible === false) polygon.hide();

    return polygon;
  }

  /**
   * Return an object of all supported event callbacks.
   */
  parseEvents() {
    return {
      onClick: createEventCallback('onClick', this.polygon).bind(this),
      onDblClick: createEventCallback('onDblClick', this.polygon).bind(this),
      onRightClick: createEventCallback('onRightClick', this.polygon).bind(this),
      onHide: createEventCallback('onHide', this.polygon).bind(this),
      onShow: createEventCallback('onShow', this.polygon).bind(this),
      onMouseDown: createEventCallback('onMouseDown', this.polygon).bind(this),
      onMouseUp: createEventCallback('onMouseUp', this.polygon).bind(this),
      onMouseOver: createEventCallback('onMouseOver', this.polygon).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.polygon).bind(this),
      onChange: createEventCallback('onChange', this.polygon).bind(this),
      onTouchStart: createEventCallback('onTouchStart', this.polygon).bind(this),
      onTouchMove: createEventCallback('onTouchMove', this.polygon).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', this.polygon).bind(this),
    };
  }

  /**
   * Bind all events on polygon instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.Polygon} polygon - AMap.Polygon instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(polygon, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(polygon, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.Polygon instance with named api and given value.
   * Won't call api if the given value does not change.
   * The new value is given to update api to avoid overwriting the props.
   * @param  {string} apiName - AMap.Polygon instance update method name
   * @param  {*} currentProp - Current value
   * @param  {*} nextProp - Next value
   * @param  {*} newProp - New value
   */
  updatePolygonWithApi(apiName, currentProp, nextProp, newProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.polygon[apiName](newProp);
    }
  }

  /**
   * Hide or show polygon.
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.polygon.show();
      if (nextProp === false) this.polygon.hide();
    }
  }


  /**
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default Polygon;
