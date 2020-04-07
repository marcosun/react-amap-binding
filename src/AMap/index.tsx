import React, { ReactNode } from 'react';
import AMapContext from '@/AMapContext';
import createEventCallback from '@/utils/createEventCallback';
import isShallowEqual from '@/utils/isShallowEqual';
import { IMap, IBounds, IOrdinaryCallback, IMouseCallback, ILngLat } from '@/types';
import isNullOrVoid from '@/utils/isNullOrVoid';

const mapContainerStyle = { width: '100%', height: '100%' };

interface IMapOptions {
  // Properties that are listed as AMap.Map.MapOptions.
  zoom?: number;
  center?: [number, number] | ILngLat;
  labelzIndex?: number;
  zooms?: [number, number];
  lang?: 'zh_cn' | 'en' | 'zh_en';
  defaultCursor?: string;
  crs?: string;
  animateEnable?: boolean;
  isHotspot?: boolean;
  rotateEnable?: boolean;
  resizeEnable?: boolean;
  showIndoorMap?: boolean;
  expandZoomRange?: boolean;
  dragEnable?: boolean;
  zoomEnable?: boolean;
  doubleClickZoom?: boolean;
  keyboardEnable?: boolean;
  jogEnable?: boolean;
  scrollWheel?: boolean;
  touchZoom?: boolean;
  touchZoomCenter?: number;
  mapStyle?: string;
  features?: ('bg' | 'point' | 'road' | 'building')[];
  showBuildingBlock?: boolean;
  viewMode?: '2D' | '3D';
  pitch?: number;
  pitchEnable?: boolean;
  buildingAnimation?: boolean;
  skyColor?: string;
  mask?: [number, number][] | [number, number][][] | [number, number][][][];
  // Properties that are used by AMap.Map methods.
  city?: string;
  bounds?: IBounds;
  limitBounds?: IBounds;
  rotation?: number;
  status?: object;
  defaultLayer?: any;
  // Internal use
  boundsProp?: [number, number][] | IBounds;
  limitBoundsProp?: [number, number][] | IBounds;
}

/**
 * Event callback.
 */
interface IMapEvents {
  onComplete?: IOrdinaryCallback;
  onClick?: IMouseCallback;
  onDblClick?: IMouseCallback;
  onMapMove?: IOrdinaryCallback;
  onHotspotClick?: IOrdinaryCallback;
  onHotspotOver?: IOrdinaryCallback;
  onHotspotOut?: IOrdinaryCallback;
  onMoveStart?: IOrdinaryCallback;
  onMoveEnd?: IOrdinaryCallback;
  onZoomChange?: IOrdinaryCallback;
  onZoomStart?: IOrdinaryCallback;
  onZoomEnd?: IOrdinaryCallback;
  onMouseMove?: IMouseCallback;
  onMouseWheel?: IMouseCallback;
  onMouseOver?: IMouseCallback;
  onMouseOut?: IMouseCallback;
  onMouseUp?: IMouseCallback;
  onMouseDown?: IMouseCallback;
  onRightClick?: IMouseCallback;
  onDragStart?: IOrdinaryCallback;
  onDragging?: IOrdinaryCallback;
  onDragEnd?: IOrdinaryCallback;
  onResize?: IOrdinaryCallback;
  onTouchStart?: IMouseCallback;
  onTouchMove?: IMouseCallback;
  onTouchEnd?: IMouseCallback;
}

interface PropType extends IMapEvents, Omit<IMapOptions, 'bounds' | 'boundsProp' | 'limitBounds' | 'limitBoundsProp'> {
  /**
   * AMap JS App key.
   */
  appKey: string;
  /**
   * South west and north east lng lat position.
   * i.e. [[soutWest], [northEast]]
   * Or AMap.Bounds instance.
   */
  bounds?: [number, number][] | IBounds;
  limitBounds?: [number, number][] | IBounds;
  children?: ReactNode;
  /**
   * Loca library version.
   */
  locaVersion?: string;
  /**
   * Whether it is http or https.
   */
  protocol?: 'http' | 'https';
  /**
   * AMap UI version.
   */
  uiVersion?: string;
  /**
   * AMap javascript library version.
   */
  version?: string;
}

interface State {
  /**
   * Map object.
   */
  map: IMap;
}

/**
 * This module imports AMap libraries (JS API, JS UI API, and Loca), and creates a map scope.
 * All other map component must be descendant of this component.
 */
class AMap extends React.PureComponent<PropType, State> {
  mapContainer: React.RefObject<HTMLInputElement> = React.createRef();
  mapOptions = AMap.parseMapOptions(this.props);
  eventCallbacks: Partial<Record<keyof IMapEvents, Function>> = {};
  AMapEventListeners: any[] = [];

  static defaultProps = {
    locaVersion: '1.3.2',
    protocol: 'https',
    uiVersion: '1.0',
    version: '1.4.15',
  };

  /**
   * Create script tag to load some scripts.
   */
  static loadScript(src: string): Promise<void> {
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
  static requireAMap({ appKey, protocol, version }: Pick<PropType, 'appKey' | 'protocol' | 'version'>) {
    const src = `${protocol}://webapi.amap.com/maps?v=${version}&key=${appKey}`;

    return AMap.loadScript(src);
  }

  /**
   * Create script tag to require AMapUI library.
   */
  static async requireAMapUI({ protocol, version }: Pick<PropType, 'protocol' | 'version'>) {
    const src = `${protocol}://webapi.amap.com/ui/${version}/main-async.js`;

    await AMap.loadScript(src);

    (window as any).initAMapUI();
  }

  /**
   * Create script tag to require Loca library.
   */
  static requireLoca({ appKey, protocol, version }: Pick<PropType, 'appKey' | 'protocol' | 'version'>) {
    const src = `${protocol}://webapi.amap.com/loca?key=${appKey}&v=${version}`;

    return AMap.loadScript(src);
  }

  /**
   * Parse AMap.Map options.
   * Filter out event callbacks, the remainings are map options.
   */
  static parseMapOptions(props: PropType): IMapOptions {
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
      limitBounds,
    } = mapOptions;

    return {
      ...mapOptions,
      bounds: AMap.parseBounds(bounds),
      boundsProp: AMap.parseBoundsProp(bounds),
      limitBounds: AMap.parseBounds(limitBounds),
      limitBoundsProp: AMap.parseBoundsProp(limitBounds),
    };
  }

  static parseBounds(bounds: PropType['bounds']) {
    /**
     * Bounds does not have any effect before AMap library has been loaded.
     * Bounds takes effect through calling setBounds function as long as AMap library has been
     * loaded.
     */
    if (isNullOrVoid(window.AMap)) return void 0;

    /**
     * The most anticipated value.
     */
    if (bounds instanceof window.AMap.Bounds) return bounds as IBounds;

    /**
     * Transform [[soutWest], [northEast]] to AMap.Bounds instance.
     */
    if (bounds instanceof Array) {
      return new window.AMap.Bounds(...bounds) as IBounds;
    }

    return bounds as IBounds;
  };

  /**
   * Memorise props.bounds.
   * We always create a new instance of AMap.Bounds if props.bounds is an array. Shallow
   * compare bounds always results unequal even if props.bounds does not change. boundsProp
   * memorises the original props.bounds. Comparing boundProp has a clear understanding
   * whether bounds has changed.
   */
  static parseBoundsProp(bounds: PropType['bounds']) {
    /**
     * Bounds does not have any effect before AMap library has been loaded.
     * Bounds takes effect through calling setBounds function as long as AMap library has been
     * loaded.
     */
    if (isNullOrVoid(window.AMap)) return void 0;

    return bounds;
  };

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
    /**
     * Hold all updates until map has been created.
     */
    if (isNullOrVoid(this.state.map)) return;

    const nextMapOptions = AMap.parseMapOptions(this.props);

    this.updateMapWithAPI('setZoom', this.mapOptions.zoom, nextMapOptions.zoom);
    this.updateMapWithAPI('setLabelzIndex', this.mapOptions.labelzIndex,
      nextMapOptions.labelzIndex);
    // Calling setLayers causes fatal exceptions
    // this.updateMapWithApi('setLayers', this.mapOptions.layers, nextMapOptions.layers);
    this.updateMapWithAPI('setCenter', this.mapOptions.center, nextMapOptions.center);
    this.updateMapWithAPI('setCity', this.mapOptions.city, nextMapOptions.city);
    /**
     * Comparing props.bounds instead of bounds because bounds are newly created everytime
     * even though props.bounds does not change.
     */
    this.updateMapWithAPI('setBounds', this.mapOptions.boundsProp, nextMapOptions.boundsProp,
      nextMapOptions.bounds);
    this.updateMapWithAPI('setLimitBounds', this.mapOptions.limitBoundsProp, nextMapOptions.limitBoundsProp,
      nextMapOptions.limitBounds);
    this.updateMapWithAPI('setLang', this.mapOptions.lang, nextMapOptions.lang);
    this.updateMapWithAPI('setRotation', this.mapOptions.rotation, nextMapOptions.rotation);
    this.updateMapWithAPI('setStatus', this.mapOptions.status, nextMapOptions.status);
    this.updateMapWithAPI('setDefaultCursor', this.mapOptions.defaultCursor,
      nextMapOptions.defaultCursor);
    this.updateMapWithAPI('setMapStyle', this.mapOptions.mapStyle, nextMapOptions.mapStyle);
    this.updateMapWithAPI('setFeatures', this.mapOptions.features, nextMapOptions.features);
    this.updateMapWithAPI('setDefaultLayer', this.mapOptions.defaultLayer,
      nextMapOptions.defaultLayer);
    this.updateMapWithAPI('setPitch', this.mapOptions.pitch, nextMapOptions.pitch);

    this.mapOptions = nextMapOptions;
  }

  /**
   * Remove event listeners.
   * Destroy AMap.Map instance.
   */
  componentWillUnmount() {
    const { map } = this.state;
    /**
     * There is a scenario where AMap has not been loaded when component unmounts.
     * AMapEventListeners and map instance are assigned only if AMap library has been loaded.
     */
    if (!isNullOrVoid(map)) {
      this.AMapEventListeners.forEach((listener) => {
        window.AMap.event.removeListener(listener);
      });

      map.destroy();
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

    if (isNullOrVoid(window.AMap)) {
      await AMap.requireAMap({ appKey, protocol, version });
      /**
       * Load AMapUI and Loca in parallel.
       */
      const AMapUI = AMap.requireAMapUI({ protocol, version: uiVersion });
      const Loca = AMap.requireLoca({ appKey, protocol, version: locaVersion });
      await AMapUI;
      await Loca;
    }

    const map: IMap = new window.AMap.Map(this.mapContainer, {
      ...this.mapOptions,
    });

    this.bindEvents(map);

    this.setState({ map });
  }

  /**
   * Bind all events on map instance, and save event listeners which will be removed in
   * componentWillUnmount lifecycle.
   */
  bindEvents(map: IMap) {
    this.AMapEventListeners = [];

    /**
     * Construct event callbacks.
     */
    this.eventCallbacks = this.parseEvents(map);

    (Object.keys(this.eventCallbacks) as Array<keyof IMapEvents>).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = this.eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(this.state.map, eventName, handler),
      );
    });
  }

  /**
   * Return an object of all supported event callbacks.
  */
  parseEvents(map: IMap) {
    return {
      onComplete: createEventCallback('onComplete', map).bind(this),
      onClick: createEventCallback('onClick', map).bind(this),
      onDblClick: createEventCallback('onDblClick', map).bind(this),
      onMapMove: createEventCallback('onMapMove', map).bind(this),
      onHotspotClick: createEventCallback('onHotspotClick', map).bind(this),
      onHotspotOver: createEventCallback('onHotspotOver', map).bind(this),
      onHotspotOut: createEventCallback('onHotspotOut', map).bind(this),
      onMoveStart: createEventCallback('onMoveStart', map).bind(this),
      onMoveEnd: createEventCallback('onMoveEnd', map).bind(this),
      onZoomChange: createEventCallback('onZoomChange', map).bind(this),
      onZoomStart: createEventCallback('onZoomStart', map).bind(this),
      onZoomEnd: createEventCallback('onZoomEnd', map).bind(this),
      onMouseMove: createEventCallback('onMouseMove', map).bind(this),
      onMouseWheel: createEventCallback('onMouseWheel', map).bind(this),
      onMouseOver: createEventCallback('onMouseOver', map).bind(this),
      onMouseOut: createEventCallback('onMouseOut', map).bind(this),
      onMouseUp: createEventCallback('onMouseUp', map).bind(this),
      onMouseDown: createEventCallback('onMouseDown', map).bind(this),
      onRightClick: createEventCallback('onRightClick', map).bind(this),
      onDragStart: createEventCallback('onDragStart', map).bind(this),
      onDragging: createEventCallback('onDragging', map).bind(this),
      onDragEnd: createEventCallback('onDragEnd', map).bind(this),
      onResize: createEventCallback('onResize', map).bind(this),
      onTouchStart: createEventCallback('onTouchStart', map).bind(this),
      onTouchMove: createEventCallback('onTouchMove', map).bind(this),
      onTouchEnd: createEventCallback('onTouchEnd', map).bind(this),
    };
  }

  /**
   * Update AMap.Map instance with named API.
   * Call update API with next prop only if props to be compared are not identical.
   * Won't call API if prop does not change.
   */
  updateMapWithAPI(apiName: string, previousCompareProp: any, nextCompareProp: any, nextProp?: any) {
    /**
     * nextProp can omit if next prop is identical to prop to be compared.
     */
    if (arguments.length === 3) {
      nextProp = nextCompareProp;
    }

    if (!isShallowEqual(previousCompareProp, nextCompareProp)) {
      this.state.map[apiName](nextProp);
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
      <div ref={this.mapContainer} style={mapContainerStyle}>
        {
          !isNullOrVoid(map) &&
          <AMapContext.Provider value={map}>
            {children}
          </AMapContext.Provider>
        }
      </div>
    );
  }
}

export default AMap;
