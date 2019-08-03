import React from 'react';
import PropTypes from 'prop-types';
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../utils/breakIfNotChildOfAMap';
import cloneDeep from '../utils/cloneDeep';
import createEventCallback from '../utils/createEventCallback';
import isShallowEqual from '../utils/isShallowEqual';

/**
 * Fields that need to be deep copied.
 * AMap LBS library mutates options. Deep copy those options before passing to AMap so that
 * props won't be mutated.
 */
const NEED_DEEP_COPY_FIELDS = ['position'];

/**
 * InfoWindow binding.
 * InfoWindow has the same options as AMap.InfoWindow unless highlighted below.
 * {@link http://lbs.amap.com/api/javascript-api/reference/infowindow}
 */
class InfoWindow extends React.Component {
  static propTypes = {
    /**
     * An array of two numbers or AMap.Pixel.
     */
    /* eslint-disable react/no-unused-prop-types */
    offset: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.object,
    ]),
    /**
     * An array of two numbers or AMap.Pixel.
     */
    position: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.object,
    ]).isRequired,
    /**
     * An array of two numbers, width and height or AMap.Size.
     */
    size: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.object,
    ]),
    /**
     * Show InfoWindow by default, you can toggle show or hide by changing visible.
     */
    visible: PropTypes.bool,
    /* eslint-disable react/sort-prop-types,react/no-unused-prop-types */
    /**
     * Event callback.
     * Signature:
     * (infoWindow, ...event) => void
     * infoWindow: AMap.InfoWindow instance.
     * event: AMap event.
     */
    onComplete: PropTypes.func,
    onChange: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    /* eslint-enable */
  };

  static defaultProps = {
    visible: true,
  };

  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

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

    const { onComplete } = this.props;

    this.map = context;

    breakIfNotChildOfAMap('InfoWindow', this.map);

    this.infoWindowOptions = InfoWindow.parseInfoWindowOptions(this.props);

    this.infoWindow = InfoWindow.initInfoWindow(this.map);

    this.bindEvents();

    typeof onComplete === 'function' && onComplete(this.map, this.infoWindow);
  }

  /**
   * Update this.infoWindow by calling AMap.InfoWindow methods.
   */
  shouldComponentUpdate(nextProps) {
    const nextInfoWindowOptions = InfoWindow.parseInfoWindowOptions(nextProps);

    const newInfoWindowOptions = cloneDeep(nextInfoWindowOptions, NEED_DEEP_COPY_FIELDS);

    this.toggleVisible(this.infoWindowOptions.visible, nextInfoWindowOptions.visible);

    this.updateInfoWindowWithAPI('setContent', this.infoWindowOptions.content,
      nextInfoWindowOptions.content, newInfoWindowOptions.content);

    this.updateInfoWindowWithAPI('setPosition', this.infoWindowOptions.position,
      nextInfoWindowOptions.position, newInfoWindowOptions.position);

    this.updateInfoWindowWithAPI('setAnchor', this.infoWindowOptions.anchor,
      nextInfoWindowOptions.anchor, newInfoWindowOptions.anchor);

    this.updateInfoWindowWithAPI('setSize', this.infoWindowOptions.size,
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
        window.AMap.event.addListener(this.infoWindow, eventName, handler),
      );
    });
  }

  /**
   * Initialise AMap.InfoWindow
   */
  initInfoWindow(map) {
    const { position, visible } = this.props;

    const newInfoWindowOptions = cloneDeep(this.infoWindowOptions, NEED_DEEP_COPY_FIELDS);

    const infoWindow = new window.AMap.InfoWindow(newInfoWindowOptions);

    infoWindow.setMap(map);

    if (visible === true) infoWindow.open(map, position);

    return infoWindow;
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
   * Hide or show infoWindow.
   */
  toggleVisible(previousProp, nextProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      const { visible, position } = nextProp;

      if (visible === true) {
        this.infoWindow.open(this.map, position);
      }
      if (visible === false) this.infoWindow.close();
    }
  }

  /**
   * Update AMap.Circle instance with named API.
   * Won't call API if prop does not change.
   */
  updateInfoWindowWithAPI(apiName, previousProp, nextProp, newProp) {
    if (!isShallowEqual(previousProp, nextProp)) {
      this.infoWindow[apiName](newProp);
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
