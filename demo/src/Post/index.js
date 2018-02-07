/**
 * @module Demo/Post
 */
import React from 'react';
import fetch from 'testComponent';

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
    console.log(fetch);
  }

  /**
   * Render a form sending post data
   * @return {Component}
   */
  render() {
    return (
      <form>
        <div>
          url: <input />
        </div>
        <div>
          data: <input />
        </div>
      </form>
    );
  }
}
