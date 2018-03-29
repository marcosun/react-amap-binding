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
 * Polygon binding
 */
class Polygon extends React.Component {
  static propTypes = {
    map: object,
    visible: bool,
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
   * [constructor description]
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
    } = props;

    breakIfNotChildOfAMap('Polygon', map);

    this.polygonOptions = this.parsePolygonOptions(props);

    this.initPolygon();

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.polygon, this.eventCallbacks);
  }

  /**
   * Update this.polygon by calling AMap.Polygon methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const nextPolygonOptions = this.parsePolygonOptions(nextProps);

    this.updatePolygonWithApi('setOptions', this.polygonOptions, nextPolygonOptions);

    this.toggleVisible(this.polygonOptions.visible, nextPolygonOptions.visible);

    this.updatePolygonWithApi('setExtData', this.polygonOptions.extData, nextPolygonOptions.extData);

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
   * Initial AMap polygon layer
   */
  initPolygon() {
    this.polygon = new window.AMap.Polygon(this.polygonOptions);

    this.props.visible === false ? this.polygon.hide() : null;
  }

  /**
   * Return an object of all supported event callbacks
   * @return {Object}
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
   * Parse AMap.Polygon options
   * @param  {Object} props
   * @return {Object}
   */
  parsePolygonOptions(props) {
    const {
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
   * Bind all events on polygon instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.Polygon} polygon - AMap.Polygon instance
   * @param  {Object} eventCallbacks - an object of all event callbacks
   */
  bindEvents(polygon, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(polygon, eventName, handler)
      );
    });
  }

  /**
   * Update AMap.Polygon instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.Polygon instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updatePolygonWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.polygon[apiName](nextProp);
    }
  }

  /**
   * Hide or show polygon
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
   * Render nothing
   * @return {null}
   */
  render() {
    return null;
  }
}

export default Polygon;