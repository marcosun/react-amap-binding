/**
 * This module specifies routes of this app
 * @module Demo/Router
 * @requires react
 * @requires react-router-dom
 * @requires {@link module:Post}
 */
import React from 'react';
import {
  BrowserRouter,
  Route,
} from 'react-router-dom';

// Require Pages
import Amap from './AMapPage';
import BezierCurve from './BezierCurve';
import Marker from './MarkerPage';
import PathNavigator from './PathNavigator';
import PathSimplifier from './PathSimplifier';
import MassMarks from './MassMarks';
import Polygon from './Polygon';
import TileLayerTraffic from './TileLayerTraffic';
import InfoWindow from './InfoWindow';
import Polyline from './Polyline';
import Loca from './Loca';

/**
 * @return {Router}
 */
export default function Router() {
  return (
    <BrowserRouter>
      <div>
        <Route exact path="/" component={Amap} />
        <Route exact path="/bezierCurve" component={BezierCurve} />
        <Route exact path="/marker" component={Marker} />
        <Route exact path="/pathSimplifier" component={PathSimplifier} />
        <Route exact path="/massMarks" component={MassMarks} />
        <Route exact path="/polygon" component={Polygon} />
        <Route exact path="/pathNavigator" component={PathNavigator}/>
        <Route exact path="/traffic" component={TileLayerTraffic} />
        <Route exact path="/infoWindow" component={InfoWindow} />
        <Route exact path="/polyline" component={Polyline} />
        <Route exact path="/loca" component={Loca} />
      </div>
    </BrowserRouter>
  );
}
