import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';

const styles = theme => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4
  }
});

class Alert extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: true
    };
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ open: false });
  };

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

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  vertical: PropTypes.string.isRequired,
  horizontal: PropTypes.string.isRequired
};

export default withStyles(styles)(Alert);
