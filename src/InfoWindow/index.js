import React from 'react';
import {
  array,
  bool,
  func,
  object,
  oneOfType,
} from 'prop-types';
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../utils/breakIfNotChildOfAMap';
import cloneDeep from '../utils/cloneDeep';
import createEventCallback from '../utils/createEventCallback';
import isShallowEqual from '../utils/isShallowEqual';

/**
 * Fields that need to be deep copied.
 * The new value is given to update api to avoid overwriting the props.
 */
const NEED_DEEP_COPY_FIELDS = ['position'];

/**
 * InfoWindow binding.
 * InfoWindow has the same config options as AMap.InfoWindow unless highlighted below.
 * For InfoWindow events usage please reference to AMap.InfoWindow events paragraph.
 * {@link http://lbs.amap.com/api/javascript-api/reference/infowindow}
 */
class InfoWindow extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /**
     * An array of two numbers or AMap.Pixel.
     */
    offset: oneOfType([array, object]), // eslint-disable-line react/no-unused-prop-types
    /**
     * An array of two numbers, width and height or AMap.Size.
     */
    size: oneOfType([array, object]), // eslint-disable-line react/no-unused-prop-types
    /**
     * Show InfoWindow by default, you can toggle show or hide by setting visible.
     */
    visible: bool, // eslint-disable-line react/no-unused-prop-types
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
   * Initialise AMap.InfoWindow
   * @param {Object} infoWindowOptions - AMap.infoWindow options
   * @param {Object} map - Map instance
   * @return {InfoWindow} - InfoWindow instance
   */
  static initInfoWindow(infoWindowOptions, map) {
    const { position, visible, ...newOptions } = infoWindowOptions;

    const infoWindow = new window.AMap.InfoWindow(cloneDeep(newOptions, NEED_DEEP_COPY_FIELDS));

    if (visible === true) infoWindow.open(map, position);

    return infoWindow;
  }

  /**
   * Parse AMap.InfoWindow options.
   * Named properties are event callbacks, other properties are infoWindow options.
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
   * Define event name mapping relations of react binding InfoWindow and AMap.InfoWindow.
   * Initialise AMap.InfoWindow and bind events.
   * Binding onComplete event on infoWindow instance.
   */
  constructor(props, context) {
    super(props);

    const { onComplete } = props;

    const map = context;

    breakIfNotChildOfAMap('InfoWindow', map);

    this.infoWindowOptions = InfoWindow.parseInfoWindowOptions(this.props);

    this.infoWindow = InfoWindow.initInfoWindow(this.infoWindowOptions, map);

    this.eventCallbacks = this.parseEvents();

    this.bindEvents(this.infoWindow, this.eventCallbacks);

    onComplete && onComplete(map, this.infoWindow);
  }

  /**
   * Update this.infoWindow by calling AMap.InfoWindow methods.
   * @param  {Object} nextProps
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const nextInfoWindowOptions = InfoWindow.parseInfoWindowOptions(nextProps);

    const newInfoWindowOptions = cloneDeep(nextInfoWindowOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.infoWindowOptions, nextInfoWindowOptions);

    this.updateInfoWindowWithApi('setContent', this.infoWindowOptions.content,
      nextInfoWindowOptions.content, newInfoWindowOptions.content);

    this.updateInfoWindowWithApi('setPosition', this.infoWindowOptions.position,
      nextInfoWindowOptions.position, newInfoWindowOptions.position);

    this.updateInfoWindowWithApi('setSize', this.infoWindowOptions.size,
      nextInfoWindowOptions.size, newInfoWindowOptions.size);

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
   * Return an object of all supported event callbacks.
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
   * Won't call api if the given value does not change.
   * The new value is given to update api to avoid overwriting the props.
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
   * Hide or show infoWindow.
   * @param  {Object} currentProp - Current value
   * @param  {Object} nextProp - Next value
   */
  toggleVisible(currentProp, nextProp) {
    if (!isShallowEqual(currentProp.visible, nextProp.visible)) {
      const { visible, position } = nextProp;
      if (visible === false) {
        this.infoWindow.close();
      } else {
        const map = this.context;
        this.infoWindow.open(map, position);
      }
    }
  }

  /**
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default InfoWindow;
