/**
 * Insert react app into the dom and enable HMR
 * @module Demo
 * @requires react
 * @requires react-dom
 * @requires react-hot-loader
 * @requires {@link module:Demo/Router}
 */
import 'babel-polyfill';
import React from 'react';
import ReactDom from 'react-dom';
import {CssBaseline} from 'material-ui';

// Separate local imports from dependencies
import Root from './router';

/**
 * Wrap react app into hot loader container to enable HMR.
 * Having spent days of time debugging and searching for the formula
 * intergrating react, redux, router, and HMR for development mode,
 * only to discover that one should ALWAYS put store on top level of containers.
 * {@link https://github.com/reactjs/react-redux/issues/356#issuecomment-333321556}
 * @param  {Router} Component - React router
 * created by {@link module:Demo/Router}
 */
const render = (Component) => {
  ReactDom.render(
    <CssBaseline>
      <Component />
    </CssBaseline>,
    document.getElementById('app')
  );
};

render(Root);
