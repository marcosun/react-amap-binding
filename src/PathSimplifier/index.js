import React from 'react';
import {
  bool,
  node,
  object,
  func,
} from 'prop-types';
import camelCase from 'lodash/camelCase';
import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import isShallowEqual from '../Util/isShallowEqual';
import createEventCallback from '../Util/createEventCallback';

/**
 * PathSimplifier binding
 * @param {PathSimplifierOptions} props - Properties defined in
 * AMapUI.PathSimplifier.
 * PathSimplifier has the same config options as AMapUI.PathSimplifier
 * unless highlighted below.
 * For PathSimplifier events usage please reference to AMapUI.PathSimplifier
 * events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference-amap-ui/mass-data/pathsimplifier}
 * Shows PathSimplifier by default, you can toggle show or hide by setting visible.
 * AMapUI.PathSimplifier opens api for updating zIndex and data only,
 * therefore, only these two props are reactive.
 * PathNavigator is not currently supported yet.
 * @param {Object} props.map - AMap map instance
 * @param {Boolean} props.visible - Toggle visibility
 * @param {function} [props.onComplete] - Initialization complete callback
 * @param {Function} props.onPathClick - Path click callback
 * @param {Function} props.onPathMouseover - Path mouseover callback
 * @param {Function} props.onPathMouseout - Path mouseout callback
 * @param {Function} props.onPointClick - Point click callback
 * @param {Function} props.onPointMouseover - Point mouseover callback
 * @param {Function} props.onPointMouseout - Point mouseout callback
 */
class PathSimplifier extends React.Component {
  static propTypes = {
    children: node,
    map: object,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    onComplete: func,
    onPathClick: func,
    onPathMouseover: func,
    onPathMouseout: func,
    onPointClick: func,
    onPointMouseover: func,
    onPointMouseout: func,
    /* eslint-enable */
    visible: bool,
  };

  // Update state to rebuild pathNavigator once nextProps.data is changed
  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isShallowEqual(nextProps.data, prevState.data)) {
      return {
        data: nextProps.data,
        isShouldDestoryPathNavigator: true,
      };
    }

    return null;
  }

  state = {
    data: [],
    isShouldDestoryPathNavigator: false,
    pathSimplifier: void 0,
  };

  /**
   * Define event name mapping relations of react binding PathSimplifier
   * and AMapUI.PathSimplifier.
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
    } = props;

    breakIfNotChildOfAMap('PathSimplifier', map);
  }

  /**
   * Asynchronously load PathSimplifier module
   * Initialise AMapUI.PathSimplifier and bind events.
   */
  componentDidMount() {
    window.AMapUI.loadUI(['misc/PathSimplifier'], (PathSimplifier) => {
      this.PathSimplifierClass = PathSimplifier;

      this.pathSimplifierOptions = this.parsePathSimplifierOptions(this.props);

      this.pathSimplifier = new PathSimplifier(this.pathSimplifierOptions);

      this.eventCallbacks = this.parseEvents();

      this.bindEvents(this.pathSimplifier, this.eventCallbacks);

      if (this.props.visible === false) this.pathSimplifier.hide();

      this.props.onComplete && this.props.onComplete(this.props.map, this.pathSimplifier);

      this.setState({
        ...this.state,
        data: this.pathSimplifierOptions.data,
        pathSimplifier: this.pathSimplifier,
      });
    });
  }

  /**
   * Update this.pathSimplifier by calling AMapUI.PathSimplifier methods
   * @param {Object} prevProps
   * @param {Object} prevState
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.pathSimplifier === void 0) {
      return;
    }

    // Recreate pathNavigator
    if (prevState.isShouldDestoryPathNavigator === true) {
      this.setState({
        ...prevState,
        isShouldDestoryPathNavigator: false,
      });
    }

    const nextPathSimplifierOptions = this.parsePathSimplifierOptions(this.props);

    this.updatePathSimplifierWithApi('setZIndexOfPath', this.pathSimplifierOptions.zIndex, nextPathSimplifierOptions.zIndex);

    this.updatePathSimplifierWithApi('setData', this.pathSimplifierOptions.data, nextPathSimplifierOptions.data);

    this.toggleVisible(this.pathSimplifierOptions.visible, nextPathSimplifierOptions.visible);

    this.pathSimplifierOptions = nextPathSimplifierOptions;
  }

  /**
   * Remove event listeners.
   * Remove pathSimplifier.
   */
  componentWillUnmount() {
    Object.keys(this.eventCallbacks).forEach((key) => {
      const eventName = camelCase(key.substring(2));
      const handler = this.eventCallbacks[key];

      this.pathSimplifier.off(eventName, handler);
    });

    this.pathSimplifier.setData();
    this.pathSimplifier = null;
  }

  /**
   * Return an object of all supported event callbacks
   * @return {Object}
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
   * Parse AMapUI.PathSimplifier options
   * Named properties are event callbacks,
   * other properties are pathSimplifier options.
   * @param {Object} props
   * @return {Object}
   */
  parsePathSimplifierOptions(props) {
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
   * Won't call api if the given value does not change
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
   * Hide or show pathSimplifier
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
   * Render nothing
   * @return {null}
   */
  render() {
    const {
      children,
      map,
    } = this.props;

    const {
      isShouldDestoryPathNavigator,
      pathSimplifier,
    } = this.state;

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
    };

    // Destory pathNavigator
    if (isShouldDestoryPathNavigator === true) {
      return null;
    }

    return pathSimplifier !== void 0
      && children !== void 0
      && childrenElement();
  }
}

export default PathSimplifier;
