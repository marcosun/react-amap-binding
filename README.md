# react-amap-binding

A React binding for AMap

We help you develop your map application with great joy by providing the following features:

 - AMap resource requiring and map instance initialisation are all done in one React component: \<AMap>
 - Will create window.AMap object once AMap library has been loaded. One single network request for AMap for the entire life of your application.
 - All children of \<AMap> have immediate access to the map instance like this: \<AMap>\<Marker />\</AMAP> 
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
 - AMap
 - Marker
 - MassMarks
 - Polygon

Todo list:
 - TileLayer.Traffic
 - InfoWindow
 - PathSimplifier