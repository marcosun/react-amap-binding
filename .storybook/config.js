import { configure, addParameters } from '@storybook/react';
import './style.css';
const query = require.context('../stories', true, /\.story\.(t|j)sx?$/)

function loadStories() {
  query.keys().forEach(key => {
    query(key)
  })
}

addParameters({
  showPanel: false
})

configure(loadStories, module);
