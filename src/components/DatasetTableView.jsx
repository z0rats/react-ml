import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import MaterialTable from 'material-table';
import CallSplitRoundedIcon from '@material-ui/icons/CallSplitRounded';
import DeleteForeverRoundedIcon from '@material-ui/icons/DeleteForeverRounded';
import * as actions from '../actions/mnn-actions.js';

const mapStateToProps = (state) => {
  const { datasets, activeTableView } = state.mnn;
  return { datasets, activeTableView };
};

const actionCreators = {
  changeActiveTableView: actions.changeActiveTableView,
  deleteDataset: actions.deleteDataset,
};

const idAliases = ['id', 'index'];

const setColumns = (dataset) => {
  const { fields } = dataset.meta;
  const columns = [];

  // if theres no id in columns then add id from tableData property
  const fieldsLowerCase = fields.map((f) => f.toLowerCase());
  if (!fieldsLowerCase.some((field) => idAliases.includes(field))) {
    columns.push({ title: 'id', render: (dataset) => dataset.tableData.id });
  }

  fields.forEach((name) => {
    const columnHeader = { title: name, field: name };
    columns.push(columnHeader);
  });

  return columns;
};

class TableView extends React.Component {
  splitDataset = () => {
    const { activeTableView, deleteDataset, changeActiveTableView } = this.props;

    const id = activeTableView;
    const prevTableViewId = activeTableView === 0 ? activeTableView : activeTableView - 1;
    changeActiveTableView({ tableId: prevTableViewId });
    deleteDataset({ id });
  }

  deleteDataset = () => {
    const { activeTableView, deleteDataset, changeActiveTableView } = this.props;
    const id = activeTableView;
    const prevTableViewId = activeTableView === 0 ? activeTableView : activeTableView - 1;
    changeActiveTableView({ tableId: prevTableViewId });
    deleteDataset({ id });
  }

  render() {
    const { id, datasets } = this.props;
    const ds = _.cloneDeep(datasets[id]);
    const rows = ds.data;
    const columns = setColumns(ds);

    return (
      <div>
        <MaterialTable
          title={ds.name}
          columns={columns}
          data={rows}
          options={{
            pageSize: 5,
            selection: false,
            exportButton: true,
            exportAllData: true,
            actionsColumnIndex: -1,
            filtering: false,
            grouping: true,
            pageSizeOptions: [5, 10, 20],
            maxBodyHeight: 300,
          }}
          actions={[
            {
              icon: () => <CallSplitRoundedIcon color="primary" />,
              tooltip: 'Разделить набор данных',
              isFreeAction: true,
              onClick: () => this.splitDataset(),
            },
            {
              icon: () => <DeleteForeverRoundedIcon color="secondary" />,
              tooltip: 'Удалить набор данных',
              isFreeAction: true,
              onClick: () => this.deleteDataset(),
            },
          ]}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, actionCreators)(TableView);
