import React from 'react';
import PropTypes from 'prop-types';
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../utils/breakIfNotChildOfAMap';
import createEventCallback from '../utils/createEventCallback';
import isShallowEqual from '../utils/isShallowEqual';

/**
 * TileLayerTraffic binding.
 * TileLayerTraffic has the same options as AMap.TileLayer.Traffic unless highlighted below.
 * {@link http://lbs.amap.com/api/javascript-api/reference/layer#TileLayer.Traffic}
 */
class TileLayerTraffic extends React.Component {
  static propTypes = {
    /**
     * Shows TileLayerTraffic by default, you can toggle show or hide by setting config.
     */
    visible: PropTypes.bool,
    /**
     * Event callback.
     * Signature:
     * (tileLayerTraffic, ...event) => void
     * tileLayerTraffic: AMap.TileLayer.Traffic instance.
     * event: AMap event.
     */
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    onComplete: PropTypes.func,
    /* eslint-enable */
  }

  static defaultProps = {
    visible: true,
  };

  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  /**
   * Parse AMap.TileLayer.Traffic options.
   * Named properties are event callbacks, other properties are tileLayerTraffic options.
   */
  static parseTileLayerTrafficOptions(props) {
    const {
      onComplete,
      ...tileLayerTrafficOptions
    } = props;

    return tileLayerTrafficOptions;
  }

  /**
   * Define event name mapping relations of react binding TileLayerTraffic and
   * AMap.TileLayer.Traffic.
   * Initialise AMap.TileLayer.Traffic and bind events.
   */
  constructor(props, context) {
    super(props);

    const map = context;

    breakIfNotChildOfAMap('TileLayerTraffic', map);

    this.tileLayerTrafficOptions = TileLayerTraffic.parseTileLayerTrafficOptions(this.props);

    this.tileLayerTraffic = this.initTileLayerTraffic(map);

    this.bindEvents();
  }

  /**
   * Update this.tileLayerTraffic by calling AMap.TileLayer.Traffic methods.
   */
  shouldComponentUpdate(nextProps) {
    const nextTileLayerTrafficOptions = TileLayerTraffic.parseTileLayerTrafficOptions(nextProps);

    this.toggleVisible(this.tileLayerTrafficOptions.visible, nextTileLayerTrafficOptions.visible);

    this.updateTileLayerTrafficWithAPI('setOpacity', this.tileLayerTrafficOptions.opacity,
      nextTileLayerTrafficOptions.opacity);

    this.updateTileLayerTrafficWithAPI('setzIndex', this.tileLayerTrafficOptions.zIndex,
      nextTileLayerTrafficOptions.zIndex);

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

    this.tileLayerTraffic.setMap(null);
    this.tileLayerTraffic = null;
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
        window.AMap.event.addListener(this.tileLayerTraffic, eventName, handler),
      );
    });
  }

  /**
   * Initialise traffic tileLayer.
   */
  initTileLayerTraffic(map) {
    const { visible } = this.props;

    const tileLayerTraffic = new window.AMap.TileLayer.Traffic(this.tileLayerTrafficOptions);

    tileLayerTraffic.setMap(map);

    if (visible === false) tileLayerTraffic.hide();

    return tileLayerTraffic;
  }

  /**
   * Return an object of all supported event callbacks.
   */
  parseEvents() {
    return {
      onComplete: createEventCallback('onComplete', this.tileLayerTraffic).bind(this),
    };
  }

  /**
   * Hide or show tileLayerTraffic.
   */
  toggleVisible(previousProp, nextProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      if (nextProp === true) this.tileLayerTraffic.show();
      if (nextProp === false) this.tileLayerTraffic.hide();
    }
  }

  /**
   * Update AMap.TileLayer.Traffic instance with named API and given value.
   * Won't call API if the given value does not change.
   */
  updateTileLayerTrafficWithAPI(apiName, previousProp, nextProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      this.tileLayerTraffic[apiName](nextProp);
    }
  }

  /**
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default TileLayerTraffic;
