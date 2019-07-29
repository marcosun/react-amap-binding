import React from 'react';
import { node } from 'prop-types';
import { hot } from 'react-hot-loader';
import { PathSimplifier } from 'react-amap-binding';
import AMap from '../AMapPage';

@hot(module)
class PathSimplifierPage extends React.Component {
  static propTypes = {
    children: node,
  };

  constructor(props) {
    super(props);

    this.state = {
      pathSimplifier: [{
        name: '轨迹0',
        path: [
          [120.239218, 30.235842],
          [120.181196, 30.264609],
          [120.167635, 30.246223],
        ],
      }],
    };
  }

  /**
   * Test Marker component update functionalities.
   */
  componentDidMount() {
    setTimeout((state) => {
      this.setState({
        pathSimplifier: [{
          name: '轨迹0',
          path: [
            [120.432955, 30.234711],
            [120.183016, 30.243906],
            [120.163431, 30.254176],
          ],
        }, {
          name: '轨迹1',
          path: [
            [120.177591, 30.217746],
            [120.215529, 30.250078],
            [120.207117, 30.276618],
          ],
        }],
      });
    }, 5000);
  }

  render() {
    const {
      children,
    } = this.props;

    return (
      <AMap>
        <PathSimplifier
          data={this.state.pathSimplifier}
          getPath={(pathData, pathIndex) => {
            return pathData.path;
          }}
          getHoverTitle={() => {
            return null;
          }}
          autoSetFitView={true}
          clickToSelectPath={false}
        >
          {children}
        </PathSimplifier>
      </AMap>
    );
  }
}

export default PathSimplifierPage;
