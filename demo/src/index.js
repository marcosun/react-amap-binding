/**
 * Insert react app into the dom and enable HMR
 * @module Demo
 * @requires react
 * @requires react-dom
 * @requires react-hot-loader
 * @requires {@link module:Demo/Router}
 */
import React from 'react';
import ReactDom from 'react-dom';
import {AppContainer} from 'react-hot-loader';
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
    <AppContainer>
      <CssBaseline>
        <Component />
      </CssBaseline>
    </AppContainer>,
    document.getElementById('app')
  );
};

render(Root);

/**
 * Watching for HMR
 */
if (module.hot) {
  /**
   * Any changes detected from React App would cause HMR
   */
  module.hot.accept('./router', () => {
    render(Root);
  });
}
