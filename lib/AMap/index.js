import React from 'react';
import {
  func,
  string,
  node,
  oneOf,
} from 'prop-types';

import createEventCallback from '../Util/createEventCallback';
import isShallowEqual from '../Util/isShallowEqual';

/**
 * AMap wrapper component to initialise AMap.
 * All map components should be childrens of this wrapper component.
 * AMap component accepts the following config properties to initialise AMap.
 * @param  {MapOptions} props - Properties defined in AMap.Map
 * {@link http://lbs.amap.com/api/javascript-api/reference/map}
 * @param  {string} props.protocol - Protocol, whether it is http or https
 * @param  {string} props.version - AMap javascript library version
 * @param  {string} props.appKey - AMap JS App key
 * @param  {string} props.uiVersion - AMap UI version
 * @param  {string} props.children - Child components
 * @param  {Function} props.onComplete - Complete callback
 * @param  {Function} props.onClick - Click callback
 * @param  {Function} props.onDbClick - DbClick callback
 * @param  {Function} props.onMapMove - MapMove callback
 * @param  {Function} props.onHotSpotClick - HotSpotClick callback
 * @param  {Function} props.onHotSpotOver - HotSpotOver callback
 * @param  {Function} props.onHotSpotOut - HotSpotOut callback
 * @param  {Function} props.MoveStart - MoveStart callback
 * @param  {Function} props.MoveEnd - MoveEnd callback
 * @param  {Function} props.onZoomChange - ZoomChange callback
 * @param  {Function} props.onZoomStart - ZoomStart callback
 * @param  {Function} props.onZoomEnd - ZoomEnd callback
 * @param  {Function} props.onMouseMove - MouseMove callback
 * @param  {Function} props.onMouseWheel - MouseWheel callback
 * @param  {Function} props.onMouseOver - MouseOver callback
 * @param  {Function} props.onMouseOut - MouseOut callback
 * @param  {Function} props.onMouseUp - MouseUp callback
 * @param  {Function} props.onMouseDown - MouseDown callback
 * @param  {Function} props.onRightClick - RightClick callback
 * @param  {Function} props.onDragStart - DragStart callback
 * @param  {Function} props.onDragging - Dragging callback
 * @param  {Function} props.onDragEnd - DragEnd callback
 * @param  {Function} props.onResize - Resize callback
 * @param  {Function} props.onTouchStart - TouchStart callback
 * @param  {Function} props.onTouchMove - TouchMove callback
 * @param  {Function} props.onTouchEnd - TouchEnd callback
 */
class AMap extends React.PureComponent {
  static propTypes = {
    protocol: oneOf(['http', 'https']),
    version: string,
    appKey: string.isRequired,
    uiVersion: string,
    children: node,
    onComplete: func,
    onClick: func,
    onDbClick: func,
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
  };

  static defaultProps = {
    protocol: 'https',
    version: '1.4.7',
    uiVersion: '1.0',
  };

  /**
   * Initialise map property with undefined
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      map: void 0,
    };

    this.mapOptions = this.parseMapOptions(this.props);
  }

  /**
   * We get map conatiner element reference until this lifecycle method
   * to instantiate AMap map object
   */
  componentDidMount() {
    this.initAMap();
  }

  /**
   * Update this.map by calling AMap.Map methods
   */
  componentDidUpdate() {
    // Hold all updates until map has been created.
    if (this.map === void 0) return;

    const nextMapOptions = this.parseMapOptions(this.props);

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
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.state.map.destroy();
  }

  /**
   * Load AMap library when neccessary
   * and instantiate map object by calling AMap.Map
   */
  async initAMap() {
    const {
      protocol,
      version,
      appKey,
      uiVersion,
      onComplete,
      onClick,
      onDbClick,
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
    } = this.props;

    if (window.AMap === void 0) {
      await this.requireAMap({protocol, version, appKey});
      await this.requireAMapUI({protocol, version: uiVersion});
      await this.requireLoca({protocol, appKey});
    }

    this.map = new window.AMap.Map(this.mapContainer, this.mapOptions);

    // Due to the fact that createEventCallback is a closure,
    // therefore this.map must be initialised before executing closure.
    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.map, this.eventCallbacks);

    this.setState({
      map: this.map,
    });
  }

  /**
   * Parse AMap.Map options
   * Named properties are event callbacks, other properties are map options.
   * @param {Object} props
   * @return {Object}
   */
  parseMapOptions(props) {
    const {
      children,
      protocol,
      version,
      appKey,
      uiVersion,
      onComplete,
      onClick,
      onDbClick,
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

    return {
      ...mapOptions,
    };
  }

  /**
   * Create script tag to require AMap library
   * @param  {string} options.protocol - Protocol, whether it is http or https
   * @param  {string} options.version  - AMap javascript library version
   * @param  {string} options.appKey   - AMap JS App key
   * @return {Promise}                 - Promise created by AMap script tag
   */
  requireAMap({protocol, version, appKey}) {
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
   * Create script tag to require AMapUI library
   * @param  {string} options.protocol - Protocol, whether it is http or https
   * @param  {string} options.version  - AMap UI javascript library version
   * @return {Promise}                 - Promise created by AMap UI script tag
   */
  requireAMapUI({protocol, version}) {
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
   * Create script tag to require Loca library
   * @param  {string} options.protocol - Protocol, whether it is http or https.
   * @param  {string} options.appKey   - AMap JS App key.
   * @return {Promise}                 - Promise created by Loca script tag.
   */
  requireLoca({protocol, appKey}) {
    const loca = document.createElement('script');
    loca.type = 'text/javascript';
    loca.src = `${protocol}://webapi.amap.com/loca?key=${appKey}`;

    document.head.appendChild(loca);

    return new Promise((resolve) => {
      loca.onload = () => {
        return resolve();
      };
    });
  }

  /**
   * Return an object of all supported event callbacks
   * @return {Object}
  */
  parseEvents() {
    return {
      onComplete: createEventCallback('onComplete', this.map).bind(this),
      onClick: createEventCallback('onClick', this.map).bind(this),
      onDbClick: createEventCallback('onDbClick', this.map).bind(this),
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
        window.AMap.event.addListener(map, eventName, handler)
      );
    });
  }

  /**
   * Update AMap.Map instance with named api and given value.
   * Won't call api if the given value does not change
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
   * Render a div element as root of AMap
   * Pass map object instantiated by AMap.Map to all direct decendents
   * @return {Component}
   */
  render() {
    const {
      children,
    } = this.props;

    const {
      map,
    } = this.state;

    const childrenElement = () => {
      if (React.isValidElement(children)) { // Single element
        return React.cloneElement(children, {map: map});
      }

      if (children.length !== void 0) { // An array of elements
        return React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {map: map});
          }
          return void 0;
        });
      }
    };

    return (
      <div style={{width: '100%', height: '100%'}}
        ref={(self) => {
          this.mapContainer = self;
        }}>
        {
          map !== void 0 && children && childrenElement()
        }
      </div>
    );
  }
}

export default AMap;
