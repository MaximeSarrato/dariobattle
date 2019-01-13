import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme: any) => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4
  }
});

interface IProps {
  message: string;
  vertical: 'bottom' | 'top';
  horizontal: 'left' | 'right' | 'center';
  classes: {
    close: string;
  };
}

interface IState {
  readonly open: boolean;
}

class Alert extends React.Component<IProps, IState> {
  readonly state: IState = {
    open: true
  };

  constructor(props: IProps) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClose(event: any, reason: string) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
  }

  render() {
    const { classes } = this.props;
    return (
      <Snackbar
        anchorOrigin={{
          vertical: this.props.vertical,
          horizontal: this.props.horizontal
        }}
        autoHideDuration={6000}
        open={this.state.open}
        onClose={this.handleClose}
        message={this.props.message}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="secondary"
            className={classes.close}
            onClick={this.handleClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    );
  }
}

export default withStyles(styles)(Alert);
