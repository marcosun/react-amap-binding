import React from 'react';
import {
  array,
  bool,
  func,
  object,
  oneOfType,
} from 'prop-types';
import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import cloneDeep from '../Util/cloneDeep';
import createEventCallback from '../Util/createEventCallback';
import isShallowEqual from '../Util/isShallowEqual';

const NEED_DEEP_COPY_FIELDS = ['position'];

/**
 * InfoWindow binding
 * InfoWindow has the same config options as AMap.InfoWindow unless highlighted below.
 * For InfoWindow events usage please reference to AMap.InfoWindow events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/infowindow}
 */
class InfoWindow extends React.Component {
  static propTypes = {
    /**
     * AMap map instance.
     */
    map: object,
    /**
     * An array of two numbers or AMap.Pixel.
     */
    offset: oneOfType([array, object]), // eslint-disable-line react/no-unused-prop-types
    /**
     * An array of two numbers, width and height or AMap.Size.
     */
    size: oneOfType([array, object]),
    /**
     * Show InfoWindow by default, you can toggle show or hide by setting visible.
     */
    visible: bool,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     *
     * @param {AMap.Map} map                  - AMap.Map instance
     * @param {AMap.InfoWindow} InfoWindow    - AMap.InfoWindow
     * @param {Object} event                  - InfoWindow event parameters
     */
    onComplete: func,
    onChange: func,
    onOpen: func,
    onClose: func,
    /* eslint-enable */
  };

  /**
   * Parse AMap.InfoWindow options
   * Named properties are event callbacks,
   * other properties are infoWindow options.
   * @param {Object} props
   * @return {Object}
   */
  static parseInfoWindowOptions(props) {
    const {
      onComplete,
      onChange,
      onOpen,
      onClose,
      ...infoWindowOptions
    } = props;

    const {
      offset,
      size,
    } = infoWindowOptions;

    return {
      ...infoWindowOptions,
      // Will transform an array of two numbers into a Pixel instance
      offset: (() => {
        if (offset instanceof window.AMap.Pixel) {
          return offset;
        }

        if (offset instanceof Array) {
          return new window.AMap.Pixel(...offset);
        }

        return new window.AMap.Pixel();
      })(),
      // Will transform an array of two numbers into a Size instance
      size: (() => {
        if (size instanceof window.AMap.Size) {
          return size;
        }

        if (size instanceof Array) {
          return new window.AMap.Size(...size);
        }

        return null;
      })(),
    };
  }

  /**
   * Define event name mapping relations of react binding InfoWindow
   * and AMap.InfoWindow.
   * Initialise AMap.InfoWindow and bind events.
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      map,
      onComplete,
    } = props;

    breakIfNotChildOfAMap('InfoWindow', map);

    this.infoWindowOptions = InfoWindow.parseInfoWindowOptions(this.props);

    this.infoWindow = this.initInfoWindow(this.infoWindowOptions);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.infoWindow, this.eventCallbacks);

    onComplete && onComplete(map, this.infoWindow);
  }

  /**
   * Update this.infoWindow by calling AMap.InfoWindow methods
   * @param  {Object} nextProps
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const nextInfoWindowOptions = InfoWindow.parseInfoWindowOptions(nextProps);

    const newInfoWindowOptions = cloneDeep(nextInfoWindowOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.infoWindowOptions.visible, nextInfoWindowOptions.visible);

    this.updateInfoWindowWithApi('setContent', this.infoWindowOptions.content, nextInfoWindowOptions.content, newInfoWindowOptions.content);

    this.updateInfoWindowWithApi('setPosition', this.infoWindowOptions.position, nextInfoWindowOptions.position, newInfoWindowOptions.position);

    this.updateInfoWindowWithApi('setSize', this.infoWindowOptions.size, nextInfoWindowOptions.size, newInfoWindowOptions.size);

    this.infoWindowOptions = nextInfoWindowOptions;

    return false;
  }

  /**
   * Remove event listeners.
   * Destroy infoWindow instance.
   */
  componentWillUnmount() {
    this.AMapEventListeners.forEach((listener) => {
      window.AMap.event.removeListener(listener);
    });

    this.infoWindow.setMap(null);
    this.infoWindow = null;
  }

   /**
   * Initialise AMap.InfoWindow
   * @param {Object} infoWindowOptions - AMap.infoWindow options
   * @return {InfoWindow}
   */
  initInfoWindow(infoWindowOptions) {
    const {
      map,
      visible,
    } = this.props;

    const infoWindow = new window.AMap.InfoWindow(cloneDeep(infoWindowOptions, NEED_DEEP_COPY_FIELDS));

    infoWindow.setMap(map);

    if (visible === false) infoWindow.close();

    return infoWindow;
  }

  /**
   * Return an object of all supported event callbacks
   * @return {Object}
   */
  parseEvents() {
    return {
      onChange: createEventCallback('onChange', this.infoWindow).bind(this),
      onOpen: createEventCallback('onOpen', this.infoWindow).bind(this),
      onClose: createEventCallback('onClose', this.infoWindow).bind(this),
    };
  }

  /**
   * Bind all events on infoWindow instance.
   * Save event listeners.
   * Later to be removed in componentWillUnmount lifecycle.
   * @param  {AMap.InfoWindow} infoWindow - AMap.InfoWindow instance
   * @param  {Object} eventCallbacks - An object of all event callbacks
   */
  bindEvents(infoWindow, eventCallbacks) {
    this.AMapEventListeners = [];

    Object.keys(eventCallbacks).forEach((key) => {
      const eventName = key.substring(2).toLowerCase();
      const handler = eventCallbacks[key];

      this.AMapEventListeners.push(
        window.AMap.event.addListener(infoWindow, eventName, handler),
      );
    });
  }

  /**
   * Update AMap.InfoWindow instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.InfoWindow instance update method name
   * @param  {*} currentProp - Current value
   * @param  {*} nextProp - Next value
   * @param  {*} newProp - New value
   */
  updateInfoWindowWithApi(apiName, currentProp, nextProp, newProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.infoWindow[apiName](newProp);
    }
  }

  /**
   * Hide or show infoWindow
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      if (nextProp === true) this.infoWindow.open();
      if (nextProp === false) this.infoWindow.close();
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

export default InfoWindow;
