import React from 'react';
import {
  array,
  bool,
  func,
  instanceOf,
  number,
  object,
  oneOfType,
  string,
  shape,
} from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';

/**
 * Loca binding
 */
class Loca extends React.Component {
  static propTypes = {
    /**
     * @ignore
     */
    data: array.isRequired,
    /**
     * @{@link http://lbs.amap.com/api/loca-api/api-manual#layer_data_option}
     */
    dataSetOptions: shape({
      lnglat: oneOfType([func, string]).isRequired,
      type: string,
    }),
    /**
     * @{@link http://lbs.amap.com/api/loca-api/api-manual#layer_options}
     */
    layerOptions: shape({
      blendMode: string,
      eventSupport: bool,
      fitView: bool,
      shape: string.isRequired,
      type: string.isRequired,
      zIndex: number,
    }).isRequired,
    /**
     * AMap map instance.
     */
    map: object,
    /**
     * @{@link http://lbs.amap.com/api/loca-api/api-manual#layer_visual_option}
     */
    visualOptions: shape({
      invisible: func,
      source: oneOfType([
        instanceOf(HTMLCanvasElement),
        instanceOf(HTMLImageElement),
        string,
      ]),
      style: object,
      selectStyle: object,
      unit: string,
    }),
  };

  /**
   * Initialise Loca.
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    const {
      data,
      dataSetOptions,
      layerOptions,
      map,
      visualOptions,
    } = props;

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
   * Update this.loca by calling Loca methods
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
   * Render nothing
   * @return {null}
   */
  render() {
    return null;
  }
}

export default Loca;
