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
 * TileLayerTraffic binding
 * TileLayerTraffic has the same config options as AMap.TileLayer.Traffic unless highlighted below.
 * For tileLayerTraffic events usage please reference to AMap.TileLayet.Traffic events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/layer#TileLayer.Traffic}
 * Shows TileLayerTraffic by default, you can toggle show or hide by setting config.
 * @param {Object} props.map - AMap map instance
 * @param {Boolean} props.visible - Toggle display
 * @param {Function} props.onComplete - Complete callback
 */
class TileLayerTraffic extends React.Component {
  static propTypes = {
    map: object,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    onComplete: func,
    /* eslint-enable */
    visible: bool,
  }

  /**
   * Define event name mapping relations of react binding TileLayerTraffic
   * and AMap.TileLayer.Traffic.
   * Initialise AMap.TileLayer.Traffic and bind events.
   * @param  {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
    } = props;

    breakIfNotChildOfAMap('TileLayerTraffic', map);

    this.tileLayerTrafficOptions = this.parseTileLayerTrafficOptions(props);

    this.tileLayerTraffic = this.initTileLayerTraffic(this.tileLayerTrafficOptions);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.tileLayerTraffic, this.eventCallbacks);
  }

  /**
   * Update this.tileLayerTraffic by calling AMap.TileLayer.Traffic methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const nextTileLayerTrafficOptions = this.parseTileLayerTrafficOptions(nextProps);

    this.updateTileLayerTrafficWithApi('setOpacity', this.tileLayerTrafficOptions.opacity, nextTileLayerTrafficOptions.opacity);

    this.toggleVisible(this.tileLayerTrafficOptions.visible, nextTileLayerTrafficOptions.visible);

    this.updateTileLayerTrafficWithApi('setzIndex', this.tileLayerTrafficOptions.zIndex, nextTileLayerTrafficOptions.zIndex);

    this.tileLayerTrafficOptions = nextTileLayerTrafficOptions;

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy tileLayerTraffic instance.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.tileLayerTraffic = null;
  }

  /**
   * Initialise traffic tileLayer
   * @param {Object} trafficOptions - AMap.TileLayer.Traffic options
   * @return {AMap.TileLayer.Traffic}
   */
  initTileLayerTraffic(trafficOptions) {
    const tileLayerTraffic = new window.AMap.TileLayer.Traffic(trafficOptions);

    if (this.props.visible === false) tileLayerTraffic.hide();

    return tileLayerTraffic;
  }

  /**
   * Return an object of all supported event callbacks
   * @return {Object}
   */
  parseEvents() {
    return {
      onComplete: createEventCallback('onComplete', this.tileLayerTraffic).bind(this),
    };
  }

  /**
   * Parse AMap.TileLayer.Traffic options
   * Named properties are event callbacks,
   * other properties are tileLayerTraffic options.
   * @param  {Object} props
   * @return {Object}
   */
  parseTileLayerTrafficOptions(props) {
    const {
      onComplete,
      ...tileLayerTrafficOptions
    } = props;

    return {
      ...tileLayerTrafficOptions,
    };
  }

  /**
   * Bind all events on tileLayerTraffic instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.TileLayer.Traffic} tileLayerTraffic - AMap.TileLayer.Traffic instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(tileLayerTraffic, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(tileLayerTraffic, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.TileLayer.Traffic instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.TileLayer.Traffic instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updateTileLayerTrafficWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.tileLayerTraffic[apiName](nextProp);
    }
  }

  /**
   * Hide or show tileLayerTraffic
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.tileLayerTraffic.show();
      if (nextProp === false) this.tileLayerTraffic.hide();
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

export default TileLayerTraffic;
