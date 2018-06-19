import React from 'react';
import {object} from 'prop-types';
import {withStyles} from 'material-ui';
import {PathNavigator} from 'react-amap-binding';

import PathSimplifier from '../PathSimplifier';

const styles = (theme) => ({
  mapContainer: {
    width: '100vw',
    height: '100vh',
  },
});

/**
 * PathNavigatorPage
 */
@withStyles(styles)
class PathNavigatorPage extends React.Component {
  static propTypes = {
    classes: object.isRequired,
  };

  /**
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.props = props;
  }

  /**
   * @return {Element}
   */
  render() {
    const {
      classes,
    } = this.props;

    return (
      <div className={classes.mapContainer}>
        <PathSimplifier>
          <PathNavigator
            pathIndex={0}
          />
        </PathSimplifier>
      </div>
    );
  }
}

export default PathNavigatorPage;
