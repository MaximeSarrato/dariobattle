import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import purple from '@material-ui/core/colors/purple';

const styles = theme => ({
  progress: {
    margin: theme.spacing.unit * 2
  }
});

const LoadingSpinner = props => {
  const { classes } = props;
  return (
    <div>
      <CircularProgress className={classes.progress} thickness={7} />
    </div>
  );
};

LoadingSpinner.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LoadingSpinner);
