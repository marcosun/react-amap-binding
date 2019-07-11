import React from 'react';
import {
  array,
  func,
  node,
  object,
  oneOf,
  oneOfType,
  string,
} from 'prop-types';
import AMapContext from '../context/AMapContext';
import createEventCallback from '../Util/createEventCallback';
import isShallowEqual from '../Util/isShallowEqual';

const mapContainerStyle = { width: '100%', height: '100%' };

/**
 * AMap wrapper component to initialise AMap.
 * All map components should be childrens of this wrapper component.
 * AMap component accepts the following config properties to initialise AMap.
 * AMap has the same config options as AMap.Map unless highlighted below.
 * {@link http://lbs.amap.com/api/javascript-api/reference/map}
 */
class AMap extends React.PureComponent {
  static propTypes = {
    /**
     * AMap JS App key.
     */
    appKey: string.isRequired,
    /**
     * A 2D array of two numbers or AMap.Bounds.
     */
    bounds: oneOfType([array, object]),
    /**
     * Child components.
     */
    children: node,
    /**
     * Loca library version.
     */
    locaVersion: string,
    /**
     * Whether it is http or https.
     */
    protocol: oneOf(['http', 'https']),
    /**
     * AMap UI version.
     */
    uiVersion: string,
    /**
     * AMap javascript library version.
     */
    version: string,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map - AMap.Map instance
     * @param {Object} event - AMap event parameters
     */
    onComplete: func,
    onClick: func,
    onDblClick: func,
    onMapMove: func,
    onHotSpotClick: func,
    onHotSpotOver: func,
    onHotSpotOut: func,
    onMoveStart: func,
    onMoveEnd: func,
    onZoomChange: func,
    onZoomStart: func,
    onZoomEnd: func,
    onMouseMove: func,
    onMouseWheel: func,
    onMouseOver: func,
    onMouseOut: func,
    onMouseUp: func,
    onMouseDown: func,
    onRightClick: func,
    onDragStart: func,
    onDragging: func,
    onDragEnd: func,
    onResize: func,
    onTouchStart: func,
    onTouchMove: func,
    onTouchEnd: func,
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
   * Named properties are event callbacks, other properties are map options.
   */
  static parseMapOptions(props) {
    const {
      children,
      locaVersion,
      protocol,
      version,
      appKey,
      uiVersion,
      onComplete,
      onClick,
      onDblClick,
      onMapMove,
      onHotSpotClick,
      onHotSpotOver,
      onHotSpotOut,
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
        // Transform bounds until map has been created.
        if (window.AMap === void 0 || bounds instanceof window.AMap.Bounds) {
          return bounds;
        }

        if (bounds instanceof Array) {
          return new window.AMap.Bounds(...bounds);
        }

        return bounds;
      })(),
    };
  }

  /**
   * Create script tag to require AMap library.
   * @param  {string} options.protocol - Protocol, whether it is http or https
   * @param  {string} options.version  - AMap javascript library version
   * @param  {string} options.appKey   - AMap JS App key
   * @return {Promise}                 - Promise created by AMap script tag
   */
  static requireAMap({ protocol, version, appKey }) {
    return new Promise((resolve) => {
      window.onJsapiLoad = () => {
        resolve();
        window.onJsapiLoad = void 0;
      };

      const jsApi = document.createElement('script');
      jsApi.type = 'text/javascript';
      jsApi.src = `${protocol}://webapi.amap.com/maps?v=${version}&key=${appKey}&callback=onJsapiLoad`;

      document.head.appendChild(jsApi);
    });
  }

  /**
   * Create script tag to require AMapUI library.
   * @param  {string} options.protocol - Protocol, whether it is http or https
   * @param  {string} options.version  - AMap UI javascript library version
   * @return {Promise}                 - Promise created by AMap UI script tag
   */
  static requireAMapUI({ protocol, version }) {
    const amapUi = document.createElement('script');
    amapUi.type = 'text/javascript';
    amapUi.src = `${protocol}://webapi.amap.com/ui/${version}/main-async.js`;

    document.head.appendChild(amapUi);

    return new Promise((resolve) => {
      amapUi.onload = () => {
        window.initAMapUI();
        return resolve();
      };
    });
  }

  /**
   * Create script tag to require Loca library.
   * @param  {string} options.protocol - Protocol, whether it is http or https.
   * @param  {string} options.appKey   - AMap JS App key.
   * @param  {string} options.version  - Loca library version.
   * @return {Promise}                 - Promise created by Loca script tag.
   */
  static requireLoca({ protocol, appKey, version }) {
    const loca = document.createElement('script');
    loca.type = 'text/javascript';
    loca.src = `${protocol}://webapi.amap.com/loca?key=${appKey}&v=${version}`;

    document.head.appendChild(loca);

    return new Promise((resolve) => {
      loca.onload = () => {
        return resolve();
      };
    });
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
   * We get map conatiner element reference until this lifecycle method to instantiate AMap map object.
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
    this.updateMapWithApi('setDefaultCursor', this.mapOptions.defaultCursor, nextMapOptions.defaultCursor);
    this.updateMapWithApi('setDefaultLayer', this.mapOptions.defaultLayer, nextMapOptions.defaultLayer);
    this.updateMapWithApi('setFeatures', this.mapOptions.features, nextMapOptions.features);
    this.updateMapWithApi('setZoom', this.mapOptions.zoom, nextMapOptions.zoom);
    this.updateMapWithApi('setLang', this.mapOptions.lang, nextMapOptions.lang);
    // Calling setLayers causes fatal exceptions
    // this.updateMapWithApi('setLayers', this.mapOptions.layers, nextMapOptions.layers);
    this.updateMapWithApi('setlabelzIndex', this.mapOptions.labelzIndex, nextMapOptions.labelzIndex);
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
     * The aMapEventListeners and map variables are assigned after the asynchronous AMap library has been loaded.
     * If the resource has not been downloaded before the component will unmount, an error will be thrown.
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
   * Load AMap library when neccessary and instantiate map object by calling AMap.Map.
   */
  async initAMap() {
    const {
      locaVersion,
      protocol,
      version,
      appKey,
      uiVersion,
    } = this.props;

    if (window.AMap === void 0) {
      await AMap.requireAMap({ protocol, version, appKey });
      await AMap.requireAMapUI({ protocol, version: uiVersion });
      await AMap.requireLoca({ protocol, appKey, version: locaVersion });
    }

    this.map = new window.AMap.Map(this.mapContainer, {
      ...this.mapOptions,
    });

    // Due to the fact that createEventCallback is a closure,
    // therefore this.map must be initialised before executing closure.
    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.map, this.eventCallbacks);

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
      onHotSpotClick: createEventCallback('onHotSpotClick', this.map).bind(this),
      onHotSpotOver: createEventCallback('onHotSpotOver', this.map).bind(this),
      onHotSpotOut: createEventCallback('onHotSpotOut', this.map).bind(this),
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
   * Bind all events on map instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.Map} map - AMap.Map instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(map, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(map, eventName, handler),
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
   * Pass map object instantiated by AMap.Map to all direct decendents.
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
