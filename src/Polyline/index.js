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
 * Polyline binding.
 * Polyline has the same options as AMap.Polyline unless highlighted below.
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#polyline}
 */
class Polyline extends React.Component {
  static propTypes = {
    /**
     * Shows Polyline by default, you can toggle show or hide by changing visible.
     */
    visible: PropTypes.bool,
    /**
     * Event callback.
     * Signature:
     * (polyline, ...event) => void
     * polyline: AMap.Polygon instance.
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
   * Parse AMap.Polyline options.
   * Named properties are event callbacks, other properties are polygon options.
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

    return polylineOptions;
  }

  /**
   * Define event name mapping relations of react binding Polyline and AMap.Polyline.
   * Initialise AMap.Polyline and bind events.
   * Fire complete action as soon as polygon has been created.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = this.props;

    const map = context;

    breakIfNotChildOfAMap('Polyline', map);

    this.polylineOptions = Polyline.parsePolylineOptions(this.props);

    this.polyline = this.initPolyline(map);

    this.bindEvents();

    typeof onComplete === 'function' && onComplete(map, this.polyline);
  }

  /**
   * Update this.polyline by calling AMap.Polyline methods.
   */
  shouldComponentUpdate(nextProps) {
    const nextPolylineOptions = Polyline.parsePolylineOptions(nextProps);

    const newPolylineOptions = cloneDeep(nextPolylineOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.polylineOptions.visible, nextPolylineOptions.visible);

    this.updatePolylineWithAPI('setOptions', this.polylineOptions, nextPolylineOptions,
      newPolylineOptions);

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
        window.AMap.event.addListener(this.polyline, eventName, handler),
      );
    });
  }

  /**
   * Initialise AMap polyline.
   */
  initPolyline(map) {
    const { visible } = this.props;

    const newPolylineOptions = cloneDeep(this.polylineOptions, NEED_DEEP_COPY_FIELDS);

    const polyline = new window.AMap.Polyline(newPolylineOptions);

    polyline.setMap(map);

    if (visible === false) polyline.hide();

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
   * Hide or show polyline.
   */
  toggleVisible(previousProp, nextProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      if (nextProp === true) this.polyline.show();
      if (nextProp === false) this.polyline.hide();
    }
  }

  /**
   * Update AMap.Polyline instance with named API and given value.
   * Won't call API if the given value does not change.
   */
  updatePolylineWithAPI(apiName, previousProp, nextProp, newProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      this.polyline[apiName](newProp);
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
