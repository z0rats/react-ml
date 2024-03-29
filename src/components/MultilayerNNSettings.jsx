import React from 'react';
import { connect } from 'react-redux';

import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import activationFunctions from '../utils/activations.js';
import Snackbar from './Snackbar';
import * as actions from '../actions/mnn-actions.js';

const mapStateToProps = (state) => {
  const {
    datasets,
    networkSettings,
    trainingSetSelector,
    testingSetSelector,
  } = state.mnn;
  return {
    datasets,
    networkSettings,
    trainingSetSelector,
    testingSetSelector,
  };
};

const actionCreators = {
  changeTrainSetSelector: actions.changeTrainSetSelector,
  changeTestSetSelector: actions.changeTestSetSelector,
  updateNetSettings: actions.updateNetSettings,
  setSnackbar: actions.setSnackbar,
  addNeuron: actions.addNeuron,
  removeNeuron: actions.removeNeuron,
};

class MultilayerNNSettings extends React.Component {
  handleChangeActivation = (name) => {
    const { updateNetSettings } = this.props;
    updateNetSettings({ activation: name });
  }

  showErrorSnackbar = (snackbarMsg = 'err', snackbarType = 'error') => {
    const { setSnackbar } = this.props;
    setSnackbar({ snackbarOpen: true, snackbarMsg, snackbarType });
  }

  handleChangeBias = () => {
    const { updateNetSettings, networkSettings } = this.props;
    updateNetSettings({ useBias: !networkSettings.useBias });
  }

  handleChangeEpoch = (value) => {
    const { updateNetSettings } = this.props;
    if (value < 1) {
      updateNetSettings({ epochCount: 1 });
      const errorMsg = 'Количество эпох не может быть меньше 1.';
      this.showErrorSnackbar(errorMsg);
    } else {
      updateNetSettings({ epochCount: Number(value) });
    }
  }

  handleChangeInputSize = (value) => {
    const {
      networkSettings, updateNetSettings, removeNeuron, addNeuron,
    } = this.props;
    const { minNeuronsInLayer, maxNeuronsInLayer } = networkSettings;
    const curInputSize = networkSettings.inputSize;
    const newInputSize = Number(value);

    if (newInputSize < minNeuronsInLayer || newInputSize > maxNeuronsInLayer) {
      const errorMsg = `Входной сигнал не может быть меньше ${minNeuronsInLayer} или больше ${maxNeuronsInLayer}.`;
      this.showErrorSnackbar(errorMsg);
    } else {
      const layerId = 0;
      if (newInputSize > curInputSize) addNeuron({ layerId });
      else removeNeuron({ layerId });
      updateNetSettings({ inputSize: newInputSize });
    }
  }

  handleChangeOutputSize = (value) => {
    const {
      updateNetSettings, networkSettings, removeNeuron, addNeuron,
    } = this.props;
    const { minNeuronsInLayer, maxNeuronsInLayer } = networkSettings;
    const curOutputSize = networkSettings.outputSize;
    const newOutputSize = Number(value);

    if (newOutputSize < minNeuronsInLayer || newOutputSize > maxNeuronsInLayer) {
      const errorMsg = `Выходной сигнал не может быть меньше ${minNeuronsInLayer} или больше ${maxNeuronsInLayer}.`;
      this.showErrorSnackbar(errorMsg);
    } else {
      const layerId = networkSettings.layers.length - 1;
      if (newOutputSize > curOutputSize) addNeuron({ layerId });
      else removeNeuron({ layerId });
      updateNetSettings({ outputSize: newOutputSize });
    }
  }

  handleChangeLearnRate = (value) => {
    const { updateNetSettings } = this.props;
    if (value < 0.001) {
      const errorMsg = 'Коэффициент обучения не может быть меньше 0.001';
      this.showErrorSnackbar(errorMsg);
    } else {
      updateNetSettings({ learningRate: Number(value) });
    }
  }

  changeTrainingSet = (id) => {
    const {
      testingSetSelector, changeTrainSetSelector, updateNetSettings, datasets,
    } = this.props;
    if (id === testingSetSelector) {
      const errorMsg = 'Обучающий и тестовый наборы не могут быть одинаковыми!';
      this.showErrorSnackbar(errorMsg);
    } else {
      changeTrainSetSelector({ id });
      updateNetSettings({ trainingSetId: datasets[id].id });
    }
  }

  changeTestingSet = (id) => {
    const {
      trainingSetSelector, changeTestSetSelector, updateNetSettings, datasets,
    } = this.props;
    if (id === trainingSetSelector) {
      const errorMsg = 'Обучающий и тестовый наборы не могут быть одинаковыми!';
      this.showErrorSnackbar(errorMsg);
    } else {
      changeTestSetSelector({ id });
      updateNetSettings({ testingSetId: datasets[id].id });
    }
  }

  render() {
    const {
      networkSettings, datasets, trainingSetSelector, testingSetSelector,
    } = this.props;
    const activationsList = Object.keys(activationFunctions);
    console.log(networkSettings);

    return (
      <Paper elevation={3}>
        <Grid container spacing={2} alignItems="center" justify="center">
          <Grid item xs={12}> Основные настройки </Grid>
          <Grid item xs={5}>
            <FormControl>
              <InputLabel shrink id="simple-select-placeholder-label-label">
                Активация
              </InputLabel>
              <Select
                labelId="simple-select-placeholder-label-label"
                value={networkSettings.activation}
                onChange={(e) => this.handleChangeActivation(e.target.value)}
                displayEmpty
              >
                {activationsList.map((name, i) => <MenuItem value={name} key={i}>{name}</MenuItem>)}
              </Select>
              <FormHelperText>По умолчанию sigmoid</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <FormControlLabel
              control={(
                <Checkbox
                  color="primary"
                  checked={networkSettings.useBias}
                  onChange={this.handleChangeBias}
                />
              )}
              label="Смещение"
            />
          </Grid>
          <br />
          <Grid item xs={6}>
            <TextField
              label="Количество эпох"
              type="number"
              margin="normal"
              variant="outlined"
              value={networkSettings.epochCount}
              onChange={(e) => this.handleChangeEpoch(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Коэффициент обучения"
              type="number"
              margin="normal"
              variant="outlined"
              value={networkSettings.learningRate}
              onChange={(e) => this.handleChangeLearnRate(e.target.value)}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" justify="center">
          <Grid item xs={12}> Наборы данных </Grid>
          <Grid item xs={6}>
            <FormControl>
              <InputLabel shrink id="simple-select-placeholder-label-label">
                Обучающий
              </InputLabel>
              <Select
                labelId="simple-select-placeholder-label-label"
                value={trainingSetSelector}
                onChange={(e) => this.changeTrainingSet(e.target.value)}
                displayEmpty
              >
                {datasets.map((ds, i) => <MenuItem value={i} key={i}>{ds.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl>
              <InputLabel shrink id="simple-select-placeholder-label-label">
                Тестовый
              </InputLabel>
              <Select
                labelId="simple-select-placeholder-label-label"
                value={testingSetSelector}
                onChange={(e) => this.changeTestingSet(e.target.value)}
                displayEmpty
              >
                {datasets.map(({ name }, i) => <MenuItem value={i} key={i}>{name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Размер входного сигнала"
              type="number"
              margin="normal"
              variant="outlined"
              value={networkSettings.inputSize}
              onChange={(e) => this.handleChangeInputSize(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Размер выхода"
              type="number"
              margin="normal"
              variant="outlined"
              value={networkSettings.outputSize}
              onChange={(e) => this.handleChangeOutputSize(e.target.value)}
            />
          </Grid>
        </Grid>
        <Snackbar />
      </Paper>
    );
  }
}

export default connect(mapStateToProps, actionCreators)(MultilayerNNSettings);
