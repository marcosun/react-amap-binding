import React from 'react';
import { hot } from 'react-hot-loader';
import { TileLayerTraffic } from 'react-amap-binding';
import AMap from '../AMapPage';

@hot(module)
class Traffic extends React.Component {
  render() {
    return (
      <AMap>
        <TileLayerTraffic
          autoRefresh={true}
        />
      </AMap>
    );
  }
}

export default Traffic;
