import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions/mnn-actions.js';

import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import DatasetTableView from './DatasetTableView';

const mapStateToProps = (state) => {
  const { activeTableView, datasets } = state.mnn;
  return { activeTableView, datasets };
};

const actionCreators = {
  changeActiveTableView: actions.changeActiveTableView,
  addDataset: actions.addDataset,
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

class DataTabs extends React.Component {
  handleChangeTable = (e, tableId) => {
    const { changeActiveTableView } = this.props;
    changeActiveTableView({ tableId });
  };

  render() {
    const { activeTableView, datasets } = this.props;

    return (
      <Grid container>
        <Grid item xs={2}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={activeTableView}
            onChange={this.handleChangeTable}
          >
            {datasets.map((ds, i) => <Tab key={i} label={ds.name}/>)}
          </Tabs>
        </Grid>
        <Grid item xs={10}>
          {datasets.map((ds, i) =>
            <TabPanel key={i} value={activeTableView} index={i}>
              <DatasetTableView
                id={i}
              />
            </TabPanel>
          )}   
        </Grid>
      </Grid>
    );
  }
}

export default connect(mapStateToProps, actionCreators)(DataTabs);