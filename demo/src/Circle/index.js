import React from 'react';
import { hot } from 'react-hot-loader';
import { Circle } from 'react-amap-binding';
import AMap from '../AMapPage';

@hot(module)
class CirclePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      circles: [{
        center: [120.162692, 30.253647],
        radius: 100,
      }, {
        center: [120.163071, 30.254444],
        radius: 100,
      }],
    };
  }

  /**
   * Test Circle component update functionalities.
   */
  componentDidMount() {
    setTimeout(() => {
      this.setState((state) => {
        return {
          circles: [
            ...state.circles.slice(0,1),
            {
              ...state.circles[1],
              radius: 1000,
            },
          ],
        };
      });
    }, 5000);
  }

  /**
   * Click handler.
   * @param {Object} map - AMap.Map instance
   * @param {Object} target - Circle component instance
   * @param {Object} e - Event
   */
  handleClick = (map, target, e) => {
    console.log(map, target, e);
  }

  render() {
    const {
      circles,
    } = this.state;

    return (
      <AMap>
        {
          circles.map((circle, index) => {
            return (
              <Circle
                key={index}
                {...circle}
                onClick={this.handleClick}
              />
            );
          })
        }
      </AMap>
    );
  }
}

export default CirclePage;

