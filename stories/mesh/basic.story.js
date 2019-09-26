/* eslint-disable */
import React from 'react';
import { storiesOf } from '@storybook/react';
import AMap from '../../src/AMap';
import Mesh from '../../src/Mesh';
import options from './mapOptions';

function drawCube() {
  const vertices = []
  const vertexColors = []
  const faces = []

  vertices.push(1000, 0, 0);
  vertexColors.push(1, 0, 0, 1);
  vertices.push(1000, 1000, 0);
  vertexColors.push(1, 0, 0, 1);
  vertices.push(0, 1000, 0);
  vertexColors.push(1, 0, 0, 1);
  faces.push(0, 2, 1)

  return { vertices, vertexColors, faces }
}

class Basic extends React.Component {
  state = {
    offsetX: 0,
    offsetY: 0
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
  }
  
  handleKeyDown = ({ key }) => {
    const offset = { x: 0, y: 0 }
    if (key === 'ArrowRight') {
      offset.x = 0.01;
    } else if (key === 'ArrowLeft') {
      offset.x = -0.01;
    } else if (key === 'ArrowUp') {
      offset.y = 0.01;
    } else if (key === 'ArrowDown') {
      offset.y = -0.01;
    } 
    this.setState((state) => {
      return {
        offsetX: state.offsetX + offset.x,
        offsetY: state.offsetY + offset.y
      }
    })
  }

  onComplete = (map) => {
    map.setZoomAndCenter(14, [120.204042, 30.190525])
  }
  render() {
    return (
      <div style={{ width: '100%', height: '100%'}}>
        <AMap
          {...options}
          onComplete={this.onComplete}
        >
          <Mesh 
            draw={drawCube}
            translation={[120.204042 + this.state.offsetX, 30.190525 + this.state.offsetY, -1000]}
          ></Mesh>
        </AMap>
       </div>
    )
  }
}


storiesOf('组件/Mesh', module)
  .add('basic', () => {
    return (
      <Basic></Basic>
    )
  });
