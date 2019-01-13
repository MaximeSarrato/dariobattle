import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = (theme: any) => ({
  progress: {
    margin: theme.spacing.unit * 2
  }
});

const LoadingSpinner = ({ classes }: { classes: { progress: string } }) => {
  return (
    <div>
      <CircularProgress className={classes.progress} thickness={7} />
    </div>
  );
};

export default withStyles(styles)(LoadingSpinner);
