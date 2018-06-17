import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import purple from 'material-ui/colors/purple';

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
