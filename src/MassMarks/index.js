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
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import cloneDeep from '../Util/cloneDeep';
import createEventCallback from '../Util/createEventCallback';
import isShallowEqual from '../Util/isShallowEqual';

/**
 * Fields that need to be deep copied.
 * The new value is given to update api to avoid overwriting the props.
 */
const NEED_DEEP_COPY_FIELDS = ['data', 'style'];

/**
 * MassMarks binding.
 * MassMarks has the same config options as AMap.MassMarks unless highlighted below.
 * For massMarks events usage please reference to AMap.MassMarks events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/layer/#MassMarks}
 */
class MassMarks extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /**
     * Include lnglat attributes of point object.
     */
    data: array.isRequired,
    /**
     * Point style.
     * It can transform an array of two numbers into AMap.Pixel instance and AMap.Size instance.
     */
    style: oneOfType([ // eslint-disable-line react/no-unused-prop-types
      arrayOf(shape({
        anchor: oneOfType([array, object]).isRequired,
        size: oneOfType([array, object]).isRequired,
        url: string.isRequired,
      })),
      shape({
        anchor: oneOfType([array, object]).isRequired,
        size: oneOfType([array, object]).isRequired,
        url: string.isRequired,
      }),
    ]).isRequired,
    /**
     * Show MassMarks by default, you can toggle show or hide by setting visible.
     */
    visible: bool,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map                  - AMap.Map instance
     * @param {AMap.MassMarks} MassMarks      - AMap.MassMarks
     * @param {Object} event                  - MassMarks event parameters
     */
    onComplete: func,
    onClick: func,
    onDblClick: func,
    onMouseOut: func,
    onMouseOver: func,
    onMouseUp: func,
    onMouseDown: func,
    onTouchStart: func,
    onTouchEnd: func,
    /* eslint-enable */
  };

  /**
   * Parse AMap.MassMarks options.
   * Named properties are event callbacks, other properties are massMarks options.
   */
  static parseMassMarksOptions(props) {
    const {
      onComplete,
      onClick,
      onDblClick,
      onMouseOut,
      onMouseOver,
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
   * Define event name mapping relations of react binding MassMarks and AMap.MassMarks.
   * Initialise AMap.MassMarks and bind events.
   */
  constructor(props, context) {
    super(props);

    const map = context;

    breakIfNotChildOfAMap('MassMarks', map);

    this.massMarksOptions = MassMarks.parseMassMarksOptions(props);

    this.massMarks = this.initMassMarks(this.massMarksOptions, map);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.massMarks, this.eventCallbacks);
  }

  /**
   * Update this.massMarks by calling AMap.MassMarks methods
   * @param  {Object} nextProps
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const nextMassMarksOptions = MassMarks.parseMassMarksOptions(nextProps);

    const newMassMarksOptions = cloneDeep(nextMassMarksOptions, NEED_DEEP_COPY_FIELDS);

    this.updateMassMarksWithApi('setStyle', this.massMarksOptions.style, nextMassMarksOptions.style, newMassMarksOptions.style);

    this.updateMassMarksWithApi('setData', this.massMarksOptions.data, nextMassMarksOptions.data, newMassMarksOptions.data);

    this.toggleVisible(this.massMarksOptions.visible, nextMassMarksOptions.visible);

    this.massMarksOptions = nextMassMarksOptions;

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
   * Initialise AMap massMarks layer.
   * @param {Object} massMarksOptions - AMap.MassMarks options
   * @param {Object} map - Map instance
   * @return {MassMarks} - MassMarks instance.
   */
  initMassMarks(massMarksOptions, map) {
    const {
      data,
      visible,
    } = this.props;

    const massMarks = new window.AMap.MassMarks(
      cloneDeep(data),
      cloneDeep(massMarksOptions, NEED_DEEP_COPY_FIELDS),
    );

    massMarks.setMap(map);

    if (visible === false) massMarks.hide();

    return massMarks;
  }

  /**
   * Return an object of all supported event callbacks.
   */
  parseEvents() {
    return {
      onComplete: createEventCallback('onComplete', this.massMarks).bind(this),
      onClick: createEventCallback('onClick', this.massMarks).bind(this),
      onDblClick: createEventCallback('onDblClick', this.massMarks).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.massMarks).bind(this),
      onMouseOver: createEventCallback('onMouseOver', this.massMarks).bind(this),
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
        window.AMap.event.addListener(massMarks, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.MassMarks instance with named api and given value.
   * Won't call api if the given value does not change.
   * The new value is given to update api to avoid overwriting the props.
   * @param  {string} apiName - AMap.MassMarks instance update method name
   * @param  {*} currentProp - Current value
   * @param  {*} nextProp - Next value
   * @param  {*} newProp - New value
   */
  updateMassMarksWithApi(apiName, currentProp, nextProp, newProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.massMarks[apiName](newProp);
    }
  }

  /**
   * Hide or show massMarks.
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
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default MassMarks;
