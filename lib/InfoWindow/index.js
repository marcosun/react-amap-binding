import React from 'react';
import {
  bool,
  func,
  object,
} from 'prop-types';

import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';
import isShallowEqual from '../Util/isShallowEqual';
import createEventCallback from '../Util/createEventCallback';

/**
 * InfoWindow binding
 * @param  {InfoWindowOptions} props - Properties defined in AMap.InfoWindow.
 * InfoWindow has the same config options as AMap.InfoWindow
 * unless highlighted below.
 * For InfoWindow events usage please reference to AMap.InfoWindow events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/infowindow}
 * Besides, it can transform an array of two numbers into AMap.Pixel instance.
 * @param {Object} props.map - AMap map instance
 * @param {Array|Pixel} props.offset - An array of two numbers or AMap.Pixel
 * @param {Boolean} props.visible - Toggle visibility
 * @param {Function} props.onChange - Attribute change callback
 * @param {Function} props.onOpen - InfoWindow open callback
 * @param {Function} props.onClose - InfoWindow close callback
 */
class InfoWindow extends React.Component {
  static propTypes = {
    map: object,
    visible: bool,
    onChange: func,
    onOpen: func,
    onClose: func,
  };

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
    } = props;

    breakIfNotChildOfAMap('InfoWindow', map);

    this.infoWindowOptions = this.parseInfoWindowOptions(this.props);

    this.eventCallbacks = this.parseEvents();

    this.infoWindow = this.initInfoWindow(this.infoWindowOptions);

    this.bindEvents(this.infoWindow, this.eventCallbacks);
  }

  /**
   * Update this.infoWindow by calling AMap.InfoWindow methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const nextInfoWindowOptions = this.parseInfoWindowOptions(nextProps);

    this.toggleVisible(this.infoWindow.visible, nextInfoWindowOptions.visible);

    this.updateInfoWindowWithApi('setContent', this.infoWindowOptions.content, nextInfoWindowOptions.content);

    this.updateInfoWindowWithApi('setPosition', this.infoWindowOptions.position, nextInfoWindowOptions.position);

    this.updateInfoWindowWithApi('setSize', this.infoWindowOptions.size, nextInfoWindowOptions.size);

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

    const infoWindow = new window.AMap.InfoWindow(infoWindowOptions);

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
   * Parse AMap.InfoWindow options
   * Named properties are event callbacks,
   * other properties are infoWindow options.
   * @param {Object} props
   * @return {Object}
   */
  parseInfoWindowOptions(props) {
    const {
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
      size: (() => {
        if (size instanceof window.AMap.Size) {
          return size;
        }

        if (size instanceof Array) {
          return new window.AMap.Size(...size);
        }
      })(),
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
        window.AMap.event.addListener(infoWindow, eventName, handler)
      );
    });
  }

  /**
   * Update AMap.InfoWindow instance with named api and given value.
   * Won't call api if the given value does not change
   * @param  {string} apiName - AMap.InfoWindow instance update method name
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  updateInfoWindowWithApi(apiName, currentProp, nextProp) {
    if (!isShallowEqual(currentProp, nextProp)) {
      this.infoWindow[apiName](nextProp);
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
