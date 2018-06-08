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

import breakIfNotChildOfAMap from '../Util/breakIfNotChildOfAMap';

/**
 * Loca binding
 * @param {Object} props
 * @param {Array} props.data - Dataset.
 * @param {Object} [props.dataSetOptions] - http://lbs.amap.com/api/loca-api/api-manual#layer_data_option
 * @param {Object} props.layerOptions - http://lbs.amap.com/api/loca-api/api-manual#layer_options
 * @param {Object} props.map - AMap map instance
 * @param {Object} [props.visualOptions] - http://lbs.amap.com/api/loca-api/api-manual#layer_visual_option
 */
class Loca extends React.Component {
  static propTypes = {
    data: array.isRequired,
    dataSetOptions: shape({
      type: string,
      lnglat: oneOfType([func, string]).isRequired,
    }),
    layerOptions: shape({
      blendMode: string,
      eventSupport: bool,
      fitView: bool,
      shape: string.isRequired,
      type: string.isRequired,
      zIndex: number,
    }).isRequired,
    map: object,
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

    this.loca.setData(data, dataSetOptions);

    this.loca.setOptions(visualOptions);

    this.loca.render();
  }

  /**
   * Update this.loca by calling Loca methods
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean} - Prevent calling render function
   */
  shouldComponentUpdate(nextProps, nextState) {
    const {
      data,
      dataSetOptions,
      visualOptions,
    } = nextProps;

    this.loca.setData(data, dataSetOptions);

    this.loca.setOptions(visualOptions);

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
