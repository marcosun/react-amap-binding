import React from 'react';
import PropTypes from 'prop-types';
import camelCase from 'lodash/camelCase';
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../utils/breakIfNotChildOfAMap';
import isShallowEqual from '../utils/isShallowEqual';
import createEventCallback from '../utils/createEventCallback';

/**
 * PathSimplifier binding.
 * PathSimplifier has the same config options as AMapUI.PathSimplifier unless highlighted below.
 * For PathSimplifier events usage please reference to AMapUI.PathSimplifier events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference-amap-ui/mass-data/pathsimplifier}
 * AMapUI.PathSimplifier opens api for updating zIndex and data only,
 * therefore, only these two props are reactive.
 */
class PathSimplifier extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /**
     * Child components.
     */
    children: PropTypes.node,
    data: PropTypes.array,
    /**
     * Shows PathSimplifier by default, you can toggle show or hide by setting visible.
     */
    visible: PropTypes.bool,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map                    - AMap.Map instance
     * @param {PathSimplifier} PathSimplifier   - PathSimplifier instance
     * @param {Object} event                    - PathSimplifier event parameters
     */
    onComplete: PropTypes.func,
    onPathClick: PropTypes.func,
    onPathMouseover: PropTypes.func,
    onPathMouseout: PropTypes.func,
    onPointClick: PropTypes.func,
    onPointMouseover: PropTypes.func,
    onPointMouseout: PropTypes.func,
    /* eslint-enable */
  };

  /**
   * PathNavigator instance should be recreated once nextProps.data is changed.
   * It will render null in the render(),
   * then call setState() immediately in componentDidUpdate() to updated
   * isShouldDestoryPathNavigator to false, finally rerender.
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isShallowEqual(nextProps.data, prevState.data)) {
      return {
        data: nextProps.data,
        isShouldDestoryPathNavigator: true,
      };
    }

    return null;
  }

  /**
   * Parse AMapUI.PathSimplifier options.
   * Named properties are event callbacks, other properties are pathSimplifier options.
   */
  static parsePathSimplifierOptions(props) {
    const {
      onComplete,
      onPathClick,
      onPathMouseover,
      onPathMouseout,
      onPointClick,
      onPointMouseover,
      onPointMouseout,
      ...pathSimplifierOptions
    } = props;

    return {
      ...pathSimplifierOptions,
    };
  }

  /**
   * Define event name mapping relations of react binding PathSimplifier and AMapUI.PathSimplifier.
   */
  constructor(props, context) {
    super(props);

    const map = context;

    breakIfNotChildOfAMap('PathSimplifier', map);
    this.state = {
      data: [],
      isShouldDestoryPathNavigator: false,
      pathSimplifier: void 0,
    };
  }

  /**
   * Asynchronously load PathSimplifier module.
   * Initialise AMapUI.PathSimplifier and bind events.
   * Binding onComplete event on pathSimplifier instance.
   */
  componentDidMount() {
    window.AMapUI.loadUI(['misc/PathSimplifier'], (PathSimplifierClass) => {
      const map = this.context;

      this.PathSimplifierClass = PathSimplifierClass;

      this.pathSimplifierOptions = {
        ...PathSimplifier.parsePathSimplifierOptions(this.props),
        map,
      };

      this.pathSimplifier = new PathSimplifierClass(this.pathSimplifierOptions);

      this.eventCallbacks = this.parseEvents();

      this.bindEvents(this.pathSimplifier, this.eventCallbacks);

      if (this.props.visible === false) this.pathSimplifier.hide();

      this.props.onComplete && this.props.onComplete(map, this.pathSimplifier);

      this.setState({
        data: this.pathSimplifierOptions.data,
        pathSimplifier: this.pathSimplifier,
      });
    });
  }

  /**
   * Update this.pathSimplifier by calling AMapUI.PathSimplifier methods.
   * @param {Object} prevProps - Previous props
   * @param {Object} prevState - Previous state
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.pathSimplifier === void 0) {
      return;
    }

    // Recreate pathNavigator
    if (prevState.isShouldDestoryPathNavigator === true) {
      this.allowToCreatePathNavigator(prevState);
    }

    const nextPathSimplifierOptions = PathSimplifier.parsePathSimplifierOptions(this.props);

    this.updatePathSimplifierWithApi('setZIndexOfPath', this.pathSimplifierOptions.zIndex,
      nextPathSimplifierOptions.zIndex);

    this.updatePathSimplifierWithApi('setData', this.pathSimplifierOptions.data,
      nextPathSimplifierOptions.data);

    this.toggleVisible(this.pathSimplifierOptions.visible, nextPathSimplifierOptions.visible);

    this.pathSimplifierOptions = nextPathSimplifierOptions;
  }

  /**
   * Remove event listeners.
   * Remove pathSimplifier.
   */
  componentWillUnmount() {
    /**
     * The eventCallbacks and pathSimplifier variables are assigned
     * after the asynchronous PathSimplifier module has been loaded.
     * If the resource has not been downloaded
     * before the component will unmount, an error will be thrown.
     */
    if (this.eventCallbacks !== void 0) {
      Object.keys(this.eventCallbacks).forEach((key) => {
        const eventName = camelCase(key.substring(2));
        const handler = this.eventCallbacks[key];

        this.pathSimplifier.off(eventName, handler);
      });
    }

    if (this.pathSimplifier !== void 0) {
      this.pathSimplifier.setData();
      this.pathSimplifier = null;
    }
  }

  /**
   * Allow to create pathNavigator after previous PathNavigator instance is destoryed.
   * @param  {Object} prevState - Previous state
   */
  allowToCreatePathNavigator(prevState) {
    this.setState({
      ...prevState,
      isShouldDestoryPathNavigator: false,
    });
  }

  /**
   * Return an object of all supported event callbacks.
   */
  parseEvents() {
    return {
      onPathClick: createEventCallback('onPathClick', this.pathSimplifier).bind(this),
      onPathMouseover: createEventCallback('onPathMouseover', this.pathSimplifier).bind(this),
      onPathMouseout: createEventCallback('onPathMouseout', this.pathSimplifier).bind(this),
      onPointClick: createEventCallback('onPointClick', this.pathSimplifier).bind(this),
      onPointMouseover: createEventCallback('onPointMouseover', this.pathSimplifier).bind(this),
      onPointMouseout: createEventCallback('onPointMouseout', this.pathSimplifier).bind(this),
    };
  }

  /**
   * Bind all events on pathSimplifier instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMapUI.PathSimplifier} pathSimplifier - AMapUI.PathSimplifier instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(pathSimplifier, eventCallbacks) {
    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = camelCase(key.substring(2));
      const handler = eventCallbacks[key];

      this.pathSimplifier.on(eventName, handler);
    });
  }

  /**
   * Update AMapUI.PathSimplifier instance with named api and given value.
   * Won't call api if the given value does not change.
   * @param  {string} apiName - AMapUI.PathSimplifier instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updatePathSimplifierWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.pathSimplifier[apiName](nextProp);
    }
  }

  /**
   * Hide or show pathSimplifier.
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.pathSimplifier.show();
      if (nextProp === false) this.pathSimplifier.hide();
    }
  }

  /**
   * Destory pathNavigator once the pathSimplifier data is changed.
   * Pass map object instantiated by AMap.Map、pathSimplifier instance
   * and pathSimplifierClass to all direct decendents.
   */
  render() {
    const {
      children,
    } = this.props;

    const {
      isShouldDestoryPathNavigator,
      pathSimplifier,
    } = this.state;

    const map = this.context;

    const childrenElement = () => {
      if (React.isValidElement(children)) { // Single element
        return React.cloneElement(children, {
          map,
          pathSimplifier,
          PathSimplifierClass: this.PathSimplifierClass,
        });
      }

      if (children.length !== void 0) { // An array of elements
        return React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              map,
              pathSimplifier,
              PathSimplifierClass: this.PathSimplifierClass,
            });
          }
          return void 0;
        });
      }

      return null;
    };

    /**
     * Destory pathNavigator.
     */
    if (isShouldDestoryPathNavigator === true) {
      return null;
    }

    return pathSimplifier !== void 0
      && children !== void 0
      && childrenElement();
  }
}

export default PathSimplifier;
