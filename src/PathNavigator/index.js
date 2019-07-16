import React from 'react';
import {
  func,
  number,
  object,
} from 'prop-types';
import AMapContext from '../context/AMapContext';
import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import isShallowEqual from '../Util/isShallowEqual';
import createEventCallback from '../Util/createEventCallback';

/**
 * PathNavigator binding.
 * PathNavigator has the same config options as PathNavigator unless highlighted below.
 * For pathNavigator events usage please reference to pathNavigator events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference-amap-ui/mass-data/pathsimplifier#PathNavigator}
 * Besides, it can transform image into pathNavigatorStyle content.
 */
class PathNavigator extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /**
     * PathSimplifier path index.
     */
    pathIndex: number.isRequired,
    /**
     * AMapUI pathSimplifier instance.
     */
    pathSimplifier: object,
    /**
     * AMapUI pathSimplifier class function.
     */
    PathSimplifierClass: func, // eslint-disable-line react/no-unused-prop-types
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map                  - AMap.Map instance
     * @param {PathNavigator} PathNavigator   - PathNavigator instance
     * @param {Object} event                  - PathNavigator event parameters
     */
    onComplete: func,
    onStart: func,
    onPause: func,
    onMove: func,
    onStop: func,
    /* eslint-enable */
  };

  /**
   * Parse PathNavigator options.
   * Named properties are event callbacks, other properties are pathNavigator options.
   */
  static parsePathNavigatorOptions(props) {
    const {
      pathIndex,
      pathSimplifier,
      PathSimplifierClass,
      onComplete,
      onStart,
      onPause,
      onMove,
      onStop,
      ...pathNavigatorOptions
    } = props;

    return {
      ...pathNavigatorOptions,
      pathNavigatorStyle: {
        ...pathNavigatorOptions.pathNavigatorStyle,
        content: (() => {
          if (pathNavigatorOptions.pathNavigatorStyle === void 0) {
            return 'defaultPathNavigator';
          }

          const {
            content,
          } = pathNavigatorOptions.pathNavigatorStyle;

          if (typeof content === 'string'
            && content !== 'defaultPathNavigator'
            && content !== 'circle'
            && content !== 'none'
          ) {
            return PathSimplifierClass.Render.Canvas.getImageContent(
              content,
              () => {
                pathSimplifier.renderLater();
              },
              () => {
                throw Error('The image could not be loaded.');
              },
            );
          }

          return content || 'defaultPathNavigator';
        })(),
      },
    };
  }

  /**
   * Define event name mapping relations of react binding PathNavigator.
   * Create pathNavigator and bind events.
   * Binding onComplete event on pathNavigator instance.
   */
  constructor(props, context) {
    super(props);

    const {
      onComplete,
      pathSimplifier,
    } = props;

    const map = context;

    breakIfNotChildOfAMap('PathNavigator', pathSimplifier, 'PathSimplifier');

    this.pathNavigatorOptions = PathNavigator.parsePathNavigatorOptions(props);

    this.pathNavigator = this.createPathNavigator(this.pathNavigatorOptions);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.pathNavigator, this.eventCallbacks);

    onComplete && onComplete(map, this.pathNavigator, pathSimplifier);
  }

  /**
   * Update this.pathNavigator by calling pathNavigator methods.
   * @param  {Object} nextProps
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const nextPathNavigatorOptions = PathNavigator.parsePathNavigatorOptions(nextProps);

    this.updatePathNavigatorWithApi('setSpeed', this.pathNavigatorOptions.speed, nextPathNavigatorOptions.speed);

    this.setRange(this.pathNavigatorOptions.range, nextPathNavigatorOptions.range);

    this.pathNavigatorOptions = nextPathNavigatorOptions;

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy pathNavigator instance.
   */
  componentWillUnmount() {
    Object.keys(this.eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = this.eventCallbacks[key];

      this.pathNavigator.off(eventName, handler);
    });

    this.pathNavigator.destroy();
    this.pathNavigator = null;
  }

  /**
   * Update pathNavigator range.
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  setRange(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.pathNavigator.setRange(nextProp[0], nextProp[1]);
    }
  }

  /**
   * Bind all events on pathNavigator instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {Object} pathNavigator - PathNavigator instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(pathNavigator, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      pathNavigator.on(eventName, handler);
    });
  }

  /**
   * Create pathNavigator.
   * @param {Object} pathNavigatorOptions - PathNavigator options
   * @return {PathNavigator}
   */
  createPathNavigator(pathNavigatorOptions) {
    const {
      pathIndex,
      pathSimplifier,
    } = this.props;

    const pathNavigator = pathSimplifier.createPathNavigator(pathIndex, pathNavigatorOptions);

    return pathNavigator;
  }

  /**
   * Return an object of all supported event callbacks.
   */
  parseEvents() {
    return {
      onStart: createEventCallback('onStart', this.pathNavigator).bind(this),
      onPause: createEventCallback('onPause', this.pathNavigator).bind(this),
      onMove: createEventCallback('onMove', this.pathNavigator).bind(this),
      onStop: createEventCallback('onStop', this.pathNavigator).bind(this),
    };
  }

  /**
   * Update pathNavigator instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - PathNavigator instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updatePathNavigatorWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.pathNavigator[apiName](nextProp);
    }
  }

  /**
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default PathNavigator;
