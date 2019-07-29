import React from 'react';
import { bool, func } from 'prop-types';
import AMapContext from '../context/AMapContext';
import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import cloneDeep from '../Util/cloneDeep';
import createEventCallback from '../Util/createEventCallback';
import isShallowEqual from '../Util/isShallowEqual';

/**
 * Fields that need to be deep copied.
 * The new value is given to update api to avoid overwriting the props.
 */
const NEED_DEEP_COPY_FIELDS = ['path'];

/**
 * Polyline binding.
 * Polyline has the same config options as AMap.Polyline unless highlighted below.
 * For Polyline events usage please reference to AMap.Polyline events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#polyline}
 * Shows Polyline by default, you can toggle show or hide by setting visible.
 * The zIndex configuration of lbs is invalid.
 */
class Polyline extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /**
     * Shows Polyline by default, you can toggle show or hide by setting visible.
     */
    visible: bool, // eslint-disable-line react/no-unused-prop-types
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map             - AMap.Map instance
     * @param {AMap.Polyline} polyline   - AMap.Polyline instance
     * @param {Object} event             - Polyline event parameters
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
   * Parse AMap.Polyline options.
   */
  static parsePolylineOptions(props) {
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
   * Define event name mapping relations of react binding Polyline and AMap.Polyline.
   * Initialise AMap.Polyline and bind events.
   * Binding onComplete event on polyline instance.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = props;

    const map = context;

    breakIfNotChildOfAMap('Polyline', map);

    this.polylineOptions = Polyline.parsePolylineOptions(props);

    this.polyline = this.initPolyline(this.polylineOptions, map);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.polyline, this.eventCallbacks);

    onComplete && onComplete(map, this.polyline);
  }

  /**
   * Update this.polyline by calling AMap.Polyline methods.
   * @param  {Object} nextProps
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const nextPolylineOptions = Polyline.parsePolylineOptions(nextProps);

    const newPolylineOptions = cloneDeep(nextPolylineOptions, NEED_DEEP_COPY_FIELDS);

    this.updatePolylineWithApi('setOptions', this.polylineOptions, nextPolylineOptions, newPolylineOptions);

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
   * Initialise AMap polyline.
   * @param {Object} polylineOptions - AMap.Polyline options
   * @param {Object} map - Map instance.
   * @return {Object}
   */
  initPolyline(polylineOptions, map) {
    const polyline = new window.AMap.Polyline(
      cloneDeep(
        {
          ...polylineOptions,
          map,
        },
        NEED_DEEP_COPY_FIELDS,
      ),
    );

    if (this.visible === false) polyline.hide();

    return polyline;
  }

  /**
   * Return an object of all supported event callbacks.
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
        window.AMap.event.addListener(polyline, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.Polyline instance with named api and given value.
   * Won't call api if the given value does not change.
   * The new value is given to update api to avoid overwriting the props.
   * @param  {string} apiName - AMap.Polyline instance update method name
   * @param  {*} currentProp - Current value
   * @param  {*} nextProp - Next value
   * @param  {*} newProp - New value
   */
  updatePolylineWithApi(apiName, currentProp, nextProp, newProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.polyline[apiName](newProp);
    }
  }

  /**
   * Hide or show polyline.
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
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default Polyline;
