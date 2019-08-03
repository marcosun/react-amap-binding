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
 * Polygon binding.
 * Polygon has the same options as AMap.Polygon unless highlighted below.
 * {@link http://lbs.amap.com/api/javascript-api/reference/overlay#polygon}
 */
class Polygon extends React.Component {
  static propTypes = {
    /**
     * Show polygon by default, you can toggle show or hide by changing visible.
     */
    visible: PropTypes.bool,
    /**
     * Event callback.
     * Signature:
     * (polygon, ...event) => void
     * polygon: AMap.Polygon instance.
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

    return polygonOptions;
  }

  /**
   * Define event name mapping relations of react binding Polygon and AMap.Polygon.
   * Initialise AMap.Polygon and bind events.
   * Fire complete action as soon as polygon has been created.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = props;

    const map = context;

    breakIfNotChildOfAMap('Polygon', map);

    this.polygonOptions = Polygon.parsePolygonOptions(this.props);

    this.polygon = this.initPolygon(map);

    this.bindEvents();

    typeof onComplete === 'function' && onComplete(map, this.polygon);
  }

  /**
   * Update this.polygon by calling AMap.Polygon methods.
   */
  shouldComponentUpdate(nextProps) {
    const nextPolygonOptions = Polygon.parsePolygonOptions(nextProps);

    const newPolygonOptions = cloneDeep(nextPolygonOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.polygonOptions.visible, nextPolygonOptions.visible);

    this.updatePolygonWithApi('setOptions', this.polygonOptions, nextPolygonOptions,
      newPolygonOptions);

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
        window.AMap.event.addListener(this.polygon, eventName, handler),
      );
    });
  }

  /**
   * Initialise AMap polygon.
   */
  initPolygon(map) {
    const { visible } = this.props;

    const newPolygonOptions = cloneDeep(this.polygonOptions, NEED_DEEP_COPY_FIELDS);

    const polygon = new window.AMap.Polygon(newPolygonOptions);

    polygon.setMap(map);

    if (visible === false) polygon.hide();

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
   * Hide or show polygon.
   */
  toggleVisible(previousProp, nextProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      if (nextProp === true) this.polygon.show();
      if (nextProp === false) this.polygon.hide();
    }
  }

  /**
   * Update AMap.Polygon instance with named API and given value.
   * Won't call API if the given value does not change.
   */
  updatePolygonWithApi(apiName, previousProp, nextProp, newProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      this.polygon[apiName](newProp);
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
