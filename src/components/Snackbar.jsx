import React from 'react';
import { connect } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import * as actions from '../actions/mnn-actions.js';

const mapStateToProps = (state) => {
  const { snackbar } = state.mnn;
  return { snackbar };
};

const actionCreators = {
  setSnackbar: actions.setSnackbar,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const CustomizedSnackbars = (props) => {
  const classes = useStyles();
  const { snackbarOpen, snackbarType, snackbarMsg } = props.snackbar;

  const handleClose = () => {
    const { setSnackbar } = props;
    setSnackbar({ snackbarOpen: false });
  };

  return (
    <div className={classes.root}>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={snackbarType}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default connect(mapStateToProps, actionCreators)(CustomizedSnackbars);
