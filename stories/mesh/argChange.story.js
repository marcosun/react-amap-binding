/* eslint-disable */
import React from 'react';
import { storiesOf } from '@storybook/react';
import anime from 'animejs';
import AMap from '../../src/AMap';
import Mesh from '../../src/Mesh';
import options from './mapOptions'

function drawCircle({ radius, segment }) {
  const vertices = [];
  const vertexColors = [];
  const faces = [];
  vertices.push(0, 0, 0);
  vertexColors.push(1, 0, 0, 1);
  for (let i = 0; i < segment; i += 1) {
    const angle = 2 * Math.PI * (i / segment);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    vertices.push(x, y, 0);
    vertexColors.push(1, 0, 0, 1);
  }
  for (let i = 1; i <= segment; i += 1) {
    faces.push(0, i + 1 > segment ? 1 : i + 1, i);
  }

  return { vertices, vertexColors, faces }
}

class ArgsChange extends React.Component {
  state = {
    radiusOffset: 1000,
    segmentOffset: 3,
    offsetX: 0,
    offsetY: 0,
    angle: 0
  }

  componentDidMount() {
    this.target = { angle: 0 }
    this.animation = anime({
      targets: this.target,
      angle: Math.PI * 2,
      easing: 'linear',
      loop: true,
      duration: 5000,
      update: () => {
        this.setState({
          angle: this.target.angle
        })
      },
    })
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    this.animation.pause();
    anime.remove(this.target);
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

    let radiusOffset = 0;
    let segmentOffset = 0;
    if (key === 'j') {
      radiusOffset = 100;
    } else if (key === 'l') {
      radiusOffset = -100;
    }

    if (key === 'h') {
      segmentOffset = 2;
    } else if (key === 'k') {
      segmentOffset = -2;
    }
    this.setState((state) => {
      return {
        radiusOffset: Math.max(Math.min(state.radiusOffset + radiusOffset, 2000), 500),
        segmentOffset: Math.max(Math.min(state.segmentOffset + segmentOffset, 56), 3),
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
            draw={drawCircle}
            args={{
              radius: this.state.radiusOffset,
              segment: this.state.segmentOffset
            }}
            translation={[120.204042 + this.state.offsetX, 30.190525 + this.state.offsetY, -1000]}
            rotation={[this.state.angle, 0, 0, 1]}
          ></Mesh>
        </AMap>
       </div>
    )
  }
}


storiesOf('组件/Mesh', module)
  .add('参数变化', () => {
    return (
      <ArgsChange></ArgsChange>
    )
  });
