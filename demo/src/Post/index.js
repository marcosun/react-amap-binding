/**
 * @module Demo/Post
 */
import React from 'react';
import test from 'Library';

/**
 * Export a form call api with post method
 */
export default class Component extends React.Component {
  /**
   * Contstructor function
   * @param {Object} props - Props
   */
  constructor(props) {
    super(props);
    alert(test());
  }

  /**
   * Render a form sending post data
   * @return {Component}
   */
  render() {
    return null;
  }
}
