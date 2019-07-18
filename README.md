
# react-amap-binding

A React binding for [AMap](https://lbs.amap.com/)

We help you develop your map application with great joy by providing the following features:

- AMap resource requiring and map instance initialisation are all done in one React component: \<AMap>
- Window.AMap object will be created once AMap library has been loaded. One single network request for AMap for the entire life of your application.
- All components except AMap have immediate access to the map instance like this: \<AMap>\<Marker />\</AMap>
- Components are initialised by calling AMap constructors with options passed through Props whose names are exactly equal to those documented by AMap. (100% compatible)
- During component lifecycle, option changes will be observed if there are corresponding AMap methods that allows us to update those changes.
- Pass event callbacks with 'on' followed by first-letter-capitalised event name documented by AMap through Props. i.e. onDragstart will be called when AMap dragstart event is called. (100% compatible)
- Event callback changes will always take effect immediately, promised! (wow!)
- Call event handlers with AMap.Map instance, followed by AMap target component instance, followed by AMap event parameters.

This is a react binding for a well documented AMap library, therefore documentation is minimal.
One could create a JSDoc and have a look at component APIs. Inspecting source code is also encouraged since there aren't many.
There is a developing and testing environemnt under 'demo' directory.

Have fun!

Completed List:
- [AMap](https://lbs.amap.com/api/javascript-api/reference/map)
- [BezierCurve](https://lbs.amap.com/api/javascript-api/reference/overlay#BezierCurve)
- [Circle](https://lbs.amap.com/api/javascript-api/reference/overlay#circle)
- [InfoWindow](http://lbs.amap.com/api/javascript-api/reference/infowindow)
- [Loca](https://lbs.amap.com/api/loca-api/prod_intro)
- [Marker](http://lbs.amap.com/api/javascript-api/reference/overlay#marker)
- [MassMarks](http://lbs.amap.com/api/javascript-api/reference/layer/#MassMarks)
- [PathNavigator](http://lbs.amap.com/api/javascript-api/reference-amap-ui/mass-data/pathsimplifier#PathNavigator)
- [PathSimplifier](http://lbs.amap.com/api/javascript-api/reference-amap-ui/mass-data/pathsimplifier)
- [Polygon](http://lbs.amap.com/api/javascript-api/reference/overlay#polygon)
- [Polyline](http://lbs.amap.com/api/javascript-api/reference/overlay#polyline)
- [TileLayer.Traffic](http://lbs.amap.com/api/javascript-api/reference/layer#TileLayer.Traffic)

## Install

React-amap-binding requires **React 16.3.0 or later**.

```sh
yarn add react-amap-binding
```

## Usage Example

```javascript
import { AMap, Marker } from 'react-amap-binding';

class UserComponent extends React.Component {
  render() {
    return (
      <AMap>
        ...
        <Marker position={[120.162692, 30.253647]} />
        ...
      </AMap>
    );
  }
}
```

## Create more components

React-amap-binding use the new React 16.3.0 context api to pass the map instance and expose AMapContext.Consumer to consume the map instance. The map instance passed will be equal to the closest AMap above in the tree.

```javascript
class Component extends React.component {
  constructor(props) {
    super(props);

    const { map } = props;
    ...
  }

  ...
}
```

How to use?

```javascript
import { AMap } from 'react-amap-binding';
import { Consumer } from 'react-amap-binding/AMap';
import Component from './Component';

class UserComponent extends React.component {
  render() {
    return (
      <AMap>
        <Consumer>
          {(map) => {
            return <Component map={map} />;
          }}
        </Consumer>
      </AMap>
    );
  }
}
```

## License

MIT
