import React from 'react';
import {
  object,
  array,
  bool,
  string,
  func,
  oneOfType,
  shape,
  arrayOf,
} from 'prop-types';

import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import isShallowEqual from '../Util/isShallowEqual';
import createEventCallback from '../Util/createEventCallback';

/**
 * MassMarks binding
 * MassMarks has the same config options as AMap.MassMarks unless highlighted below.
 * For massMarks events usage please reference to AMap.MassMarks events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/layer/#MassMarks}
 * Shows MassMarks by default, you can toggle show or hide by setting visible.
 * Besides, it can transform an array of two numbers into AMap.Pixel instance and AMap.Size instance.
 * @param {Object} props.map - AMap map instance
 * @param {Array} props.data - Include lnglat attributes of point object
 * @param {Boolean} props.visible - Toggle visibility
 * @param {Array|Object} props.style - Point style
 * @param {Array|Pixel} props.style.anchor - Point position offset
 * @param {String} props.style.url - Point url
 * @param {Array|Size} props.style.size - Point size
 * @param {Function} props.onComplete - Complete callback
 * @param {Function} props.onClick - Click callback
 * @param {Function} props.onDblClick - Double click callback
 * @param {Function} props.onMouseOut - Mouse out callback
 * @param {Function} props.onMouseUp - Mouse up callback
 * @param {Function} props.onMouseDown - Mouse down callback
 * @param {Function} props.onTouchStart - Touch start callback
 * @param {Function} props.onTouchEnd - Touch end callback
 */
class MassMarks extends React.Component {
  static propTypes = {
    map: object,
    data: array.isRequired,
    visible: bool,
    style: oneOfType([
      arrayOf(shape({
        anchor: oneOfType([array, object]).isRequired,
        url: string.isRequired,
        size: oneOfType([array, object]).isRequired,
      })),
      shape({
        anchor: oneOfType([array, object]).isRequired,
        url: string.isRequired,
        size: oneOfType([array, object]).isRequired,
      }),
    ]).isRequired,
    onComplete: func,
    onClick: func,
    onDblClick: func,
    onMouseOut: func,
    onMouseUp: func,
    onMouseDown: func,
    onTouchStart: func,
    onTouchEnd: func,
  };

  /**
   * Define event name mapping relations of react binding MassMarks
   * and AMap.MassMarks.
   * Initialise AMap.MassMarks and bind events.
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
    } = props;

    breakIfNotChildOfAMap('MassMarks', map);

    this.massMarksOptions = this.parseMassMarksOptions(props);

    this.massMarks = this.initMassMarks(this.massMarksOptions);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.massMarks, this.eventCallbacks);
  }

  /**
   * Update this.massMarks by calling AMap.MassMarks methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const nextMassMarksOptions = this.parseMassMarksOptions(nextProps);

    this.updateMassMarksWithApi('setStyle', this.massMarksOptions.style, nextMassMarksOptions.style);

    this.updateMassMarksWithApi('setData', this.massMarksOptions.data, nextMassMarksOptions.data);

    this.toggleVisible(this.massMarksOptions.visible, nextMassMarksOptions.visible);

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy massMarks instance.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.massMarks.clear();
    this.massMarks = null;
  }

  /**
   * Parse AMap.MassMarks options
   * Named properties are event callbacks, other properties are massMarks options.
   * @param  {Object} props
   * @return {Object}
   */
  parseMassMarksOptions(props) {
    const {
      onComplete,
      onClick,
      onDblClick,
      onMouseOut,
      onMouseUp,
      onMouseDown,
      onTouchStart,
      onTouchEnd,
      ...massMarksOptions
    } = props;

    const {
      style,
    } = massMarksOptions;

    return {
      ...massMarksOptions,
      style: (() => {
        if (style instanceof Array) {
          return style.map((styleObject) => {
            return {
              ...styleObject,
              anchor: styleObject.anchor instanceof window.AMap.Pixel
                ? styleObject.anchor
                : new window.AMap.Pixel(...styleObject.anchor),
              size: styleObject.size instanceof window.AMap.Size
                ? styleObject.size
                : new window.AMap.Size(...styleObject.size),
            };
          });
        }

        return {
          ...style,
          anchor: new window.AMap.Pixel(...style.anchor),
          size: new window.AMap.Size(...style.size),
        };
      })(),
    };
  }

  /**
   * Initialise AMap massMarks layer
   * @param {Object} massMarksOptions - AMap.MassMarks options
   * @return {MassMarks}
   */
  initMassMarks(massMarksOptions) {
    const {
      map,
      data,
      visible,
    } = this.props;

    const massMarks = new window.AMap.MassMarks(data, massMarksOptions);

    massMarks.setMap(map);

    if (visible === false) massMarks.hide();

    return massMarks;
  }

  /**
   * Return an object of all supported event callbacks
   * @return {Object}
   */
  parseEvents() {
    return {
      onComplete: createEventCallback('onComplete', this.massMarks).bind(this),
      onClick: createEventCallback('onClick', this.massMarks).bind(this),
      onDblClick: createEventCallback('onDblClick', this.massMarks).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.massMarks).bind(this),
      onMouseUp: createEventCallback('onMouseUp', this.massMarks).bind(this),
      onMouseDown: createEventCallback('onMouseDown', this.massMarks).bind(this),
      onTouchStart: createEventCallback('onTouchStart', this.massMarks).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', this.massMarks).bind(this),
    };
  }

  /**
   * Bind all events on massMarks instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.MassMarks} massMarks - AMap.MassMarks instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(massMarks, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(massMarks, eventName, handler)
      );
    });
  }

  /**
   * Update AMap.MassMarks instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.MassMarks instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updateMassMarksWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.massMarks[apiName](nextProp);
    }
  }

  /**
   * Hide or show massMarks
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.massMarks.show();
      if (nextProp === false) this.massMarks.hide();
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

export default MassMarks;
