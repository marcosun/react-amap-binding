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
const NEED_DEEP_COPY_FIELDS = ['data', 'style'];

/**
 * MassMarks binding.
 * MassMarks has the same options as AMap.MassMarks unless highlighted below.
 * {@link http://lbs.amap.com/api/javascript-api/reference/layer/#MassMarks}
 */
class MassMarks extends React.Component {
  static propTypes = {
    /**
     * MassMarks dataset.
     */
    data: PropTypes.arrayOf(PropTypes.shape({
      lnglat: PropTypes.arrayOf(PropTypes.number).isRequired,
    })).isRequired,
    /* eslint-disable react/no-unused-prop-types */
    style: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.shape({
        /**
         * An array of two numbers or AMap.Pixel.
         */
        anchor: PropTypes.oneOfType([
          PropTypes.arrayOf(PropTypes.number),
          PropTypes.object,
        ]).isRequired,
        /**
         * An array of two numbers or AMap.Size.
         */
        size: PropTypes.oneOfType([
          PropTypes.arrayOf(PropTypes.number),
          PropTypes.object,
        ]).isRequired,
      })),
      PropTypes.shape({
        anchor: PropTypes.oneOfType([
          PropTypes.arrayOf(PropTypes.number),
          PropTypes.object,
        ]).isRequired,
        size: PropTypes.oneOfType([
          PropTypes.arrayOf(PropTypes.number),
          PropTypes.object,
        ]).isRequired,
      }),
    ]).isRequired,
    /**
     * Show MassMarks by default, you can toggle show or hide by changing visible.
     */
    visible: PropTypes.bool,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     * Signature:
     * (massMarks, ...event) => void
     * massMarks: AMap.MassMarks instance.
     * event: AMap event.
     */
    onComplete: PropTypes.func,
    onClick: PropTypes.func,
    onDblClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseUp: PropTypes.func,
    onMouseDown: PropTypes.func,
    onTouchStart: PropTypes.func,
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
   * Parse AMap.MassMarks options.
   * Named properties are event callbacks, other properties are massMarks options.
   */
  static parseMassMarksOptions(props) {
    const {
      onComplete,
      onClick,
      onDblClick,
      onMouseOver,
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
          anchor: style.anchor instanceof window.AMap.Pixel
            ? style.anchor
            : new window.AMap.Pixel(...style.anchor),
          size: style.size instanceof window.AMap.Size
           ? style.size
            : new window.AMap.Size(...style.size),
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

    this.massMarksOptions = MassMarks.parseMassMarksOptions(this.props);

    this.massMarks = this.initMassMarks(map);

    this.bindEvents();
  }

  /**
   * Update this.massMarks by calling AMap.MassMarks methods
   */
  shouldComponentUpdate(nextProps) {
    const nextMassMarksOptions = MassMarks.parseMassMarksOptions(nextProps);

    const newMassMarksOptions = cloneDeep(nextMassMarksOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.massMarksOptions.visible, nextMassMarksOptions.visible);

    this.updateMassMarksWithAPI('setStyle', this.massMarksOptions.style, nextMassMarksOptions.style,
      newMassMarksOptions.style);

    this.updateMassMarksWithAPI('setData', this.massMarksOptions.data, nextMassMarksOptions.data,
      newMassMarksOptions.data);

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

    this.massMarks.setMap(null);
    this.massMarks = null;
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
        window.AMap.event.addListener(this.massMarks, eventName, handler),
      );
    });
  }

  /**
   * Initialise AMap massMarks layer.
   */
  initMassMarks(map) {
    const {
      data,
      visible,
    } = this.props;

    const newMassMarksData = cloneDeep(data);
    const newMassMarksOptions = cloneDeep(this.massMarksOptions, NEED_DEEP_COPY_FIELDS);

    const massMarks = new window.AMap.MassMarks(
      newMassMarksData,
      newMassMarksOptions,
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
      onMouseOver: createEventCallback('onMouseOver', this.massMarks).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.massMarks).bind(this),
      onMouseUp: createEventCallback('onMouseUp', this.massMarks).bind(this),
      onMouseDown: createEventCallback('onMouseDown', this.massMarks).bind(this),
      onTouchStart: createEventCallback('onTouchStart', this.massMarks).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', this.massMarks).bind(this),
    };
  }

  /**
   * Hide or show massMarks.
   */
  toggleVisible(previousProp, nextProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      if (nextProp === true) this.massMarks.show();
      if (nextProp === false) this.massMarks.hide();
    }
  }

  /**
   * Update AMap.MassMarks instance with named API and given value.
   * Won't call API if the given value does not change.
   */
  updateMassMarksWithAPI(apiName, previousProp, nextProp, newProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      this.massMarks[apiName](newProp);
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
