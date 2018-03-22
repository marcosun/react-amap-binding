import React from 'react';
import {
  object,
  func,
} from 'prop-types';
import _ from 'lodash';

import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';

/**
 * PathSimplifier binding
 */
class PathSimplifier extends React.PureComponent {
  static propTypes = {
    map: object,
    onPathClick: func,
    onPathMouseover: func,
    onPathMouseout: func,
    onPointClick: func,
    onPointMouseover: func,
    onPointMouseout: func,
  };

  /**
   * @param {PathSimplifierOptions} props - Properties defined in
   * AMapUI.PathSimplifier.
   * PathSimplifier has the same config options as AMapUI.PathSimplifier
   * unless highlighted below.
   * PathSimplifier events usage please reference to AMapUI.PathSimplifier
   * events paragraph.
   * {@link http://lbs.amap.com/api/javascript-api/reference-amap-ui/mass-data/pathsimplifier}
   * @param {Object} props.map - AMap map instance
   * @param {Function} props.onPathClick - Path click callback
   * @param {Function} props.onPathMouseover - Path mouseover callback
   * @param {Function} props.onPathMouseout - Path mouseout callback
   * @param {Function} props.onPointClick - Point click callback
   * @param {Function} props.onPointMouseover - Point mouseover callback
   * @param {Function} props.onPointMouseout - Point mouseout callback
   */
  constructor(props) {
    super(props);

    const {
      map,
    } = props;

    breakIfNotChildOfAMap('PathSimplifier', map);

    this.parseProps();
  }

  /**
   * Asynchronously load PathSimplifier module
   */
  componentDidMount() {
    window.AMapUI.loadUI(['misc/PathSimplifier'], (PathSimplifier) => {
      this.PathSimplifier = PathSimplifier;

      this.initPathSimplifier();

      this.bindEvents();
    });
  }

  /**
   * Remove event listeners.
   */
  componentWillUnmount() {
    Object.keys(this.eventCallbacks).forEach((key) => {
      const eventName = _.camelCase(key.substring(2));
      const handler = this.eventCallbacks[key];

      this.pathSimplifier.off(eventName, handler);
    });
  }

  /**
   * Parse event callbacks and path simplifier options
   * Named properties are event callbacks.
   * All other properties are path simplifier options.
   */
  parseProps() {
    const {
      onPathClick,
      onPathMouseover,
      onPathMouseout,
      onPointClick,
      onPointMouseover,
      onPointMouseout,
      ...pathSimplifierOptions
    } = this.props;

    this.eventCallbacks = {
      onPathClick,
      onPathMouseover,
      onPathMouseout,
      onPointClick,
      onPointMouseover,
      onPointMouseout,
    };

    // Filter out invalid event callbacks
    this.eventCallbacks = _.pickBy(this.eventCallbacks, (callback) => {
      return typeof callback === 'function';
    });

    this.pathSimplifierOptions = pathSimplifierOptions;
  }

  /**
   * Instantiate path simplifier by calling AMapUI.PathSimplifier.
   */
  initPathSimplifier() {
    this.pathSimplifier = new this.PathSimplifier(this.pathSimplifierOptions);
  }

  /**
   * Bind events on path simplifier instance.
   */
  bindEvents() {
    Object.keys(this.eventCallbacks).forEach((key) => {
      // React binding event names equal to 'on' event names defined by AMapUI
      const eventName = _.camelCase(key.substring(2));
      const handler = this.eventCallbacks[key];

      this.pathSimplifier.on(eventName, handler);
    });
  }

  /**
   * Render nothing
   * @return {null}
   */
  render() {
    return null;
  }
}

export default PathSimplifier;
