import React from 'react';
import {
  bool,
  func,
  object,
} from 'prop-types';

import breakIfNotChildOfAMap from 'Util/breakIfNotChildOfAMap';
import isShallowEqual from 'Util/isShallowEqual';
import createEventCallback from 'Util/createEventCallback';

/**
 * BezierCurve binding
 */
class BezierCurve extends React.Component {
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
    onTouchEnd: func,
  };

  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
    } = props;

    breakIfNotChildOfAMap('BezierCurve', map);

    this.bezierCurveOptions = this.parseBezierCurveOptions(this.props);

    this.eventCallbacks = this.parseEvents();

    this.bezierCurve = this.initBezierCurve(this.bezierCurveOptions);

    this.bindEvents(this.bezierCurve, this.eventCallbacks);
  }

  /**
   * Update this.bezierCurve by calling AMap.BezierCurve methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const nextBezierCurveOptions = this.parseBezierCurveOptions(nextProps);

    this.toggleVisible(this.bezierCurveOptions.visible, nextBezierCurveOptions.visible);

    this.updateBezierCurveWithApi('setPath', this.bezierCurveOptions.path, nextBezierCurveOptions.path);

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

    const bezierCurve = new window.AMap.BezierCurve(bezierCurveOptions);

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
        window.AMap.event.addListener(bezierCurve, eventName, handler)
      );
    });
  }

  /**
   * Update AMap.BezierCurve instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.BezierCurve instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updateBezierCurveWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.bezierCurve[apiName](nextProp);
    }
  }

  /**
   * Hide or show bezierCurve
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.bezierCurve.open();
      if (nextProp === false) this.bezierCurve.close();
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
