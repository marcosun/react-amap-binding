import React from 'react';
import PropTypes from 'prop-types';
import AMapContext from '../AMapContext';
import createEventCallback from '../utils/createEventCallback';
import isShallowEqual from '../utils/isShallowEqual';

const mapContainerStyle = { width: '100%', height: '100%' };

/**
 * This module imports AMap libraries (JS API, JS UI API, and Loca), and creates a map scope.
 * All other map component should be descendant of this component.
 */
class AMap extends React.PureComponent {
  /**
   * AMap component accepts the following options to initialise AMap.
   * AMap has the same options as AMap.Map unless highlighted below.
   * {@link http://lbs.amap.com/api/javascript-api/reference/map}
   */
  static propTypes = {
    /**
     * AMap JS App key.
     */
    appKey: PropTypes.string.isRequired,
    /* eslint-disable-next-line react/no-unused-prop-types */
    bounds: PropTypes.oneOfType([
      /**
       * South west and north east lng lat position.
       * i.e. [[soutWest], [northEast]]
       */
      PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      /**
       * AMap.Bounds instance.
       */
      PropTypes.object,
    ]),
    /**
     * Child components.
     */
    children: PropTypes.node,
    /**
     * Loca library version.
     * Loca will be deprecated in the next major version. Please consider react-amap-2drender for
     * rendering map UI components with high performance.
     */
    locaVersion: PropTypes.string,
    /**
     * Whether it is http or https.
     */
    protocol: PropTypes.oneOf(['http', 'https']),
    /**
     * AMap UI version.
     */
    uiVersion: PropTypes.string,
    /**
     * AMap javascript library version.
     */
    version: PropTypes.string,
    /**
     * Event callback.
     * Signature:
     * (map, ...event) => void
     * map: AMap instance.
     * event: AMap event.
     */
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    onComplete: PropTypes.func,
    onClick: PropTypes.func,
    onDblClick: PropTypes.func,
    onMapMove: PropTypes.func,
    onHotspotClick: PropTypes.func,
    onHotspotOver: PropTypes.func,
    onHotspotOut: PropTypes.func,
    onMoveStart: PropTypes.func,
    onMoveEnd: PropTypes.func,
    onZoomChange: PropTypes.func,
    onZoomStart: PropTypes.func,
    onZoomEnd: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseWheel: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseUp: PropTypes.func,
    onMouseDown: PropTypes.func,
    onRightClick: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragging: PropTypes.func,
    onDragEnd: PropTypes.func,
    onResize: PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchMove: PropTypes.func,
    onTouchEnd: PropTypes.func,
    /* eslint-enable */
  };

  static defaultProps = {
    locaVersion: '1.0.5',
    protocol: 'https',
    version: '1.4.7',
    uiVersion: '1.0',
  };

  /**
   * Parse AMap.Map options.
   * Filter out event callbacks, the remainings are map options.
   */
  static parseMapOptions(props) {
    const {
      appKey,
      children,
      locaVersion,
      protocol,
      uiVersion,
      version,
      onComplete,
      onClick,
      onDblClick,
      onMapMove,
      onHotspotClick,
      onHotspotOver,
      onHotspotOut,
      onMoveStart,
      onMoveEnd,
      onZoomChange,
      onZoomStart,
      onZoomEnd,
      onMouseMove,
      onMouseWheel,
      onMouseOver,
      onMouseOut,
      onMouseUp,
      onMouseDown,
      onRightClick,
      onDragStart,
      onDragging,
      onDragEnd,
      onResize,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      ...mapOptions
    } = props;

    const {
      bounds,
    } = mapOptions;

    return {
      ...mapOptions,
      bounds: (() => {
        /**
         * Bounds does not have any effect before AMap library has been loaded.
         * Bounds takes effect through calling setBounds function as long as AMap library has been
         * loaded.
         */
        if (window.AMap === void 0) return void 0;

        /**
         * The most anticipated value.
         */
        if (bounds instanceof window.AMap.Bounds) return bounds;

        /**
         * Transform [[soutWest], [northEast]] to AMap.Bounds instance.
         */
        if (bounds instanceof Array) {
          return new window.AMap.Bounds(...bounds);
        }

        return bounds;
      })(),
    };
  }

  /**
   * Create script tag to load some scripts.
   */
  static loadScript(src) {
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = src;

    document.head.appendChild(scriptTag);

    return new Promise((resolve) => {
      scriptTag.onload = () => {
        return resolve();
      };
    });
  }

  /**
   * Create script tag to require AMap library.
   */
  static requireAMap({ appKey, protocol, version }) {
    const src = `${protocol}://webapi.amap.com/maps?v=${version}&key=${appKey}`;

    return AMap.loadScript(src);
  }

  /**
   * Create script tag to require AMapUI library.
   */
  static async requireAMapUI({ protocol, version }) {
    const src = `${protocol}://webapi.amap.com/ui/${version}/main-async.js`;

    await AMap.loadScript(src);

    window.initAMapUI();
  }

  /**
   * Create script tag to require Loca library.
   */
  static requireLoca({ appKey, protocol, version }) {
    const src = `${protocol}://webapi.amap.com/loca?key=${appKey}&v=${version}`;

    return AMap.loadScript(src);
  }

  /**
   * Initialise map property with undefined.
   */
  constructor(props) {
    super(props);

    this.state = {
      map: void 0,
    };

    this.mapOptions = AMap.parseMapOptions(this.props);
  }

  /**
   * We get map conatiner element reference until this lifecycle method to instantiate
   * AMap map object.
   */
  componentDidMount() {
    this.initAMap();
  }

  /**
   * Update this.map by calling AMap.Map methods.
   */
  componentDidUpdate() {
    // Hold all updates until map has been created.
    if (this.map === void 0) return;

    const nextMapOptions = AMap.parseMapOptions(this.props);

    this.updateMapWithApi('setBounds', this.mapOptions.bounds, nextMapOptions.bounds);
    this.updateMapWithApi('setCenter', this.mapOptions.center, nextMapOptions.center);
    this.updateMapWithApi('setCity', this.mapOptions.city, nextMapOptions.city);
    this.updateMapWithApi('setDefaultCursor', this.mapOptions.defaultCursor,
      nextMapOptions.defaultCursor);
    this.updateMapWithApi('setDefaultLayer', this.mapOptions.defaultLayer,
      nextMapOptions.defaultLayer);
    this.updateMapWithApi('setFeatures', this.mapOptions.features, nextMapOptions.features);
    this.updateMapWithApi('setZoom', this.mapOptions.zoom, nextMapOptions.zoom);
    this.updateMapWithApi('setLang', this.mapOptions.lang, nextMapOptions.lang);
    // Calling setLayers causes fatal exceptions
    // this.updateMapWithApi('setLayers', this.mapOptions.layers, nextMapOptions.layers);
    this.updateMapWithApi('setlabelzIndex', this.mapOptions.labelzIndex,
      nextMapOptions.labelzIndex);
    this.updateMapWithApi('setMapStyle', this.mapOptions.mapStyle, nextMapOptions.mapStyle);
    this.updateMapWithApi('setPitch', this.mapOptions.pitch, nextMapOptions.pitch);
    this.updateMapWithApi('setRotation', this.mapOptions.rotation, nextMapOptions.rotation);
    this.updateMapWithApi('setStatus', this.mapOptions.status, nextMapOptions.status);

    this.mapOptions = nextMapOptions;
  }

  /**
   * Remove event listeners.
   * Destroy AMap.Map instance.
   */
  componentWillUnmount() {
    /**
     * The aMapEventListeners and map variables are assigned after the asynchronous AMap library
     * has been loaded.
     * If the resource has not been downloaded before the component will unmount, an error will
     * be thrown.
     */
    if (this.AMapEventListeners !== void 0) {
      this.AMapEventListeners.forEach((listener) => {
        window.AMap.event.removeListener(listener);
      });
    }
    if (this.state.map !== void 0) {
      this.state.map.destroy();
    }
  }

  /**
   * Load AMap library and instantiate map object by calling AMap.Map.
   */
  async initAMap() {
    const {
      appKey,
      locaVersion,
      protocol,
      uiVersion,
      version,
    } = this.props;

    if (window.AMap === void 0) {
      await AMap.requireAMap({ appKey, protocol, version });
      /**
       * Load AMapUI and Loca in parallel.
       */
      const AMapUI = AMap.requireAMapUI({ protocol, version: uiVersion });
      const Loca = AMap.requireLoca({ appKey, protocol, version: locaVersion });
      await AMapUI;
      await Loca;
    }

    this.map = new window.AMap.Map(this.mapContainer, {
      ...this.mapOptions,
    });

    this.bindEvents();

    this.setState({
      map: this.map,
    });
  }

  /**
   * Return an object of all supported event callbacks.
  */
  parseEvents() {
    return {
      onComplete: createEventCallback('onComplete', this.map).bind(this),
      onClick: createEventCallback('onClick', this.map).bind(this),
      onDblClick: createEventCallback('onDblClick', this.map).bind(this),
      onMapMove: createEventCallback('onMapMove', this.map).bind(this),
      onHotspotClick: createEventCallback('onHotspotClick', this.map).bind(this),
      onHotspotOver: createEventCallback('onHotspotOver', this.map).bind(this),
      onHotspotOut: createEventCallback('onHotspotOut', this.map).bind(this),
      onMoveStart: createEventCallback('onMoveStart', this.map).bind(this),
      onMoveEnd: createEventCallback('onMoveEnd', this.map).bind(this),
      onZoomChange: createEventCallback('onZoomChange', this.map).bind(this),
      onZoomStart: createEventCallback('onZoomStart', this.map).bind(this),
      onZoomEnd: createEventCallback('onZoomEnd', this.map).bind(this),
      onMouseMove: createEventCallback('onMouseMove', this.map).bind(this),
      onMouseWheel: createEventCallback('onMouseWheel', this.map).bind(this),
      onMouseOver: createEventCallback('onMouseOver', this.map).bind(this),
      onMouseOut: createEventCallback('onMouseOut', this.map).bind(this),
      onMouseUp: createEventCallback('onMouseUp', this.map).bind(this),
      onMouseDown: createEventCallback('onMouseDown', this.map).bind(this),
      onRightClick: createEventCallback('onRightClick', this.map).bind(this),
      onDragStart: createEventCallback('onDragStart', this.map).bind(this),
      onDragging: createEventCallback('onDragging', this.map).bind(this),
      onDragEnd: createEventCallback('onDragEnd', this.map).bind(this),
      onResize: createEventCallback('onResize', this.map).bind(this),
      onTouchStart: createEventCallback('onTouchStart', this.map).bind(this),
      onTouchMove: createEventCallback('onTouchMove', this.map).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', this.map).bind(this),
    };
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
    this.eventCallbacks = this.parseEvents();

    Object.keys(this.eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = this.eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(this.map, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.Map instance with named api and given value.
   * Won't call api if the given value does not change.
   * @param  {string} apiName - AMap.Map instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updateMapWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.map[apiName](nextProp);
    }
  }

  /**
   * Render a div element as root of AMap.
   */
  render() {
    const {
      children,
    } = this.props;

    const {
      map,
    } = this.state;

    return (
      <div ref={(self) => { this.mapContainer = self; }} style={mapContainerStyle}>
        <AMapContext.Provider value={map}>
          {map !== void 0 && children}
        </AMapContext.Provider>
      </div>
    );
  }
}

export default AMap;
