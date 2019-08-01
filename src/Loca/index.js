import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import AMapContext from '../AMapContext';
import breakIfNotChildOfAMap from '../utils/breakIfNotChildOfAMap';

/**
 * Loca binding.
 */
class Loca extends React.Component {
  /**
   * AMap map instance.
   */
  static contextType = AMapContext;

  static propTypes = {
    /**
     * @ignore
     */
    data: PropTypes.array.isRequired,
    /**
     * @{@link http://lbs.amap.com/api/loca-api/api-manual#layer_data_option}
     */
    dataSetOptions: PropTypes.shape({
      lnglat: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
      type: PropTypes.string,
    }),
    /**
     * @{@link http://lbs.amap.com/api/loca-api/api-manual#layer_options}
     */
    layerOptions: PropTypes.shape({
      blendMode: PropTypes.string,
      eventSupport: PropTypes.bool,
      fitView: PropTypes.bool,
      shape: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      zIndex: PropTypes.number,
    }).isRequired,
    /**
     * @{@link http://lbs.amap.com/api/loca-api/api-manual#layer_visual_option}
     */
    visualOptions: PropTypes.shape({
      invisible: PropTypes.func,
      selectStyle: PropTypes.object,
      source: PropTypes.oneOfType([
        PropTypes.instanceOf(HTMLCanvasElement),
        PropTypes.instanceOf(HTMLImageElement),
        PropTypes.string,
      ]),
      style: PropTypes.object,
      unit: PropTypes.string,
    }),
  };

  /**
   * Initialise Loca.
   */
  constructor(props, context) {
    super(props);

    const {
      data,
      dataSetOptions,
      layerOptions,
      visualOptions,
    } = props;

    const map = context;

    breakIfNotChildOfAMap('Loca', map);

    const locaMap = new window.Loca(map);

    this.loca = new window.Loca.VisualLayer({
      container: locaMap,
      ...layerOptions,
    });

    this.loca.setData(cloneDeep(data), cloneDeep(dataSetOptions));

    this.loca.setOptions(cloneDeep(visualOptions));

    this.loca.render();
  }

  /**
   * Update this.loca by calling Loca methods.
   * @param  {Object} nextProps
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps) {
    const {
      data,
      dataSetOptions,
      visualOptions,
    } = nextProps;

    this.loca.setData(cloneDeep(data), cloneDeep(dataSetOptions));

    this.loca.setOptions(cloneDeep(visualOptions));

    this.loca.render();

    return false;
  }

  /**
   * Destroy loca instance.
   */
  componentWillUnmount() {
    this.loca.destroy();
  }

  /**
   * Render nothing.
   */
  render() {
    return null;
  }
}

export default Loca;
