import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import papa from 'papaparse';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';

import PlayCircleFilledRoundedIcon from '@material-ui/icons/PlayCircleFilledRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';
import IconButton from '@material-ui/core/IconButton';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import DatasetTabs from './DatasetTabs';
import MultilayerNNSettings from './MultilayerNNSettings';
import { generateWeights, extractLastColumn, smallValuesArr } from '../utils/utils.js';
import normalization from '../utils/normalization.js';
import activations from '../utils/activations.js';
import * as actions from '../actions/mnn-actions.js';

const mapStateToProps = (state) => {
  const {
    uploadingSettings,
    activeTab,
    datasets,
    canvasSettings,
    networkSettings,
  } = state.mnn;
  return {
    uploadingSettings, activeTab, datasets, canvasSettings, networkSettings,
  };
};

const actionCreators = {
  changeUploadingSettings: actions.changeUploadingSettings,
  updateCanvas: actions.updateCanvas,
  updateNetSettings: actions.updateNetSettings,
  addLayer: actions.addLayer,
  removeLayer: actions.removeLayer,
  addDataset: actions.addDataset,
};

const readCsv = (file, options) => (
  new Promise((resolve) => {
    papa.parse(file, {
      skipEmptyLines: options.skipEmptyLines,
      header: options.headers,
      complete: (results) => {
        resolve(results);
      },
    });
  })
);

const createDataSet = (name, rawData) => {
  const nameWithoutExtension = name.split('.').slice(0, -1).join('.');
  const result = rawData;

  return {
    id: _.uniqueId(), name: nameWithoutExtension, data: result.data, meta: result.meta,
  };
};

class MultilayerNN extends Component {
  canvasRef = React.createRef();

  componentDidMount() {
    const { canvasSettings, updateCanvas, networkSettings } = this.props;
    const { canvasImageData, canvasWidth, canvasHeight } = canvasSettings;

    const canvasContext = this.canvasRef.current.getContext('2d');
    if (_.isNull(canvasImageData)) {
      this.drawNetworkLayers(canvasContext, networkSettings.layers);
    } else {
      canvasContext.putImageData(canvasImageData, 0, 0);
    }
    const imageData = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight);
    updateCanvas({ canvasImageData: imageData });
  }

  componentDidUpdate(prevProps) {
    const { networkSettings, canvasSettings, updateCanvas } = this.props;
    const { canvasWidth, canvasHeight } = canvasSettings;

    if (!_.isEqual(networkSettings.layers, prevProps.networkSettings.layers)) {
      const ctx = this.canvasRef.current.getContext('2d');
      // this.updateWeights(networkSettings.layers);
      this.drawNetworkLayers(ctx, networkSettings.layers);
    }
  }

  getNeuronCoord = (isEven, index, middleIndex, radius, axisPadding, canvasAxisCenter) => {
    if (isEven) {
      if (index < middleIndex) {
        const margin = (middleIndex - index) * (radius * axisPadding);
        return canvasAxisCenter - margin;
      }
      const margin = (index + 1 - middleIndex) * (radius * axisPadding);
      return canvasAxisCenter + margin;
    }
    if (index === middleIndex) return canvasAxisCenter;
    if (index < middleIndex) {
      const margin = (middleIndex - index) * (radius * axisPadding);
      return canvasAxisCenter - margin;
    }
    const margin = (index - middleIndex) * (radius * axisPadding);
    return canvasAxisCenter + margin;
  }

  drawNetworkLayers = (ctx, layers) => {
    const { updateCanvas, networkSettings, canvasSettings } = this.props;
    const {
      canvasWidth, canvasHeight, neuronRadius, inputDotRadius, paddingX, paddingY,
    } = canvasSettings;
    //  { layers } = networkSettings;
    console.log(layers);

    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    const layersCount = layers.length;
    const middleLayerIndex = Math.floor(layersCount / 2);
    const isNumberOfLayersEven = layersCount % 2 === 0;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    layers.forEach((layer, lIndex) => {
      const layerLength = layer.neurons.length;
      const middleNeuronIndex = Math.floor(layerLength / 2);
      const isNumberOfNeuronsEven = layerLength % 2 === 0;
      const centerX = this.getNeuronCoord(isNumberOfLayersEven, lIndex, middleLayerIndex, neuronRadius, paddingX, canvasCenterX);

      for (let nIndex = 0; nIndex < layerLength; nIndex += 1) {
        const neuron = layer.neurons[nIndex];
        const centerY = this.getNeuronCoord(isNumberOfNeuronsEven, nIndex, middleNeuronIndex, neuronRadius, paddingY, canvasCenterY);

        ctx.beginPath();
        if (lIndex === 0) {
          ctx.arc(centerX, centerY, inputDotRadius, 0, Math.PI * 2, false);
          ctx.fillStyle = 'black';
        } else {
          ctx.arc(centerX, centerY, neuronRadius, 0, Math.PI * 2, false);
          // lIndex === layersCount - 1 ? ctx.fillStyle = '#4c8ffc' : ctx.fillStyle = '#ffb947';
          ctx.fillStyle = '#34eb46';
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.font = '20px serif';
        if (lIndex !== 0) ctx.fillText(neuron.output.toFixed(2), centerX, centerY, neuronRadius * 2);
        // else console.log(neuron.output);

        if (lIndex < layersCount - 1) {
          const nextLayer = layers[lIndex + 1];
          const nextLayerLength = nextLayer.neurons.length;
          const isNumberOfNeuronsEven = nextLayerLength % 2 === 0;
          const middleNeuronIndex = Math.floor(nextLayerLength / 2);
          neuron.weights.forEach((w, i) => {
            ctx.beginPath();
            const x = this.getNeuronCoord(isNumberOfLayersEven, lIndex + 1, middleLayerIndex, neuronRadius, paddingX, canvasCenterX);
            const y = this.getNeuronCoord(isNumberOfNeuronsEven, i, middleNeuronIndex, neuronRadius, paddingY, canvasCenterY);
            const margin = lIndex === 0 ? inputDotRadius : neuronRadius;
            ctx.lineWidth = Math.abs(w * 15);
            // ctx.lineWidth = w > 0 ? Math.log(w) : Math.log(-w);
            ctx.strokeStyle = w > 0 ? '#eba434' : '#1bb2f7';
            ctx.moveTo(centerX + margin, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
          });
        }
      }
    });

    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    updateCanvas({ canvasImageData: imageData });
  }

  handleSubmit = (files, allFiles) => {
    allFiles.forEach((f) => f.remove());
    const { addDataset, uploadingSettings } = this.props;

    files.forEach(async ({ file }) => {
      try {
        const { name } = file;
        const csvData = await readCsv(file, uploadingSettings);
        console.log(csvData);
        const dataset = createDataSet(name, csvData);
        addDataset({ dataset });
      } catch (e) {
        console.log(e);
      }
    });
  };

  handleChangeHeaders = () => {
    const { changeUploadingSettings, uploadingSettings } = this.props;
    changeUploadingSettings({ headers: !uploadingSettings.headers });
  }

  handleChangeSkipEmptyLines = () => {
    const { changeUploadingSettings, uploadingSettings } = this.props;
    changeUploadingSettings({ skipEmptyLines: !uploadingSettings.skipEmptyLines });
  }

  updateWeights = (from = 0, layers) => {
    const { updateNetSettings } = this.props;

    for (let lIndex = from; lIndex < layers.length; lIndex += 1) {
      const layer = layers[lIndex];
      let numOfWeights = 0;
      if (lIndex < layers.length - 1) {
        numOfWeights = layers[lIndex + 1].neurons.length;
      }
      layer.neurons.forEach((n) => {
        n.weights = generateWeights(numOfWeights);
      });
    }
    updateNetSettings({ layers });
  };

  makeForwardPass = (inputs, targets, layers) => {
    console.log(inputs, targets);
    const { updateNetSettings, networkSettings } = this.props;
    const { activation } = networkSettings;
    // const layers = _.cloneDeep(networkSettings.layers);
    const activationFunction = activations[activation];

    // init first layer
    layers[0].neurons.forEach((n, i) => {
      n.output = inputs[i];
    });
    // run sigmoid
    for (let lIndex = 1; lIndex < layers.length; lIndex += 1) {
      const layer = layers[lIndex];
      for (let j = 0; j < layer.neurons.length; j += 1) {
        const neuron = layer.neurons[j];
        const b = neuron.bias;
        const connectionsValue = layers[lIndex - 1].neurons.reduce((prev, curN) => prev + curN.weights[j] * curN.output, 0);

        // neuron.setOutput(this.activation(b + connectionsValue));
        neuron.output = activationFunction.activate(b + connectionsValue);
      }
    }
    // calc deltas
    for (let lIndex = layers.length - 1; lIndex >= 0; lIndex -= 1) {
      const currLayer = layers[lIndex];

      for (let nIndex = 0; nIndex < currLayer.neurons.length; nIndex += 1) {
        const currNeuron = currLayer.neurons[nIndex];
        const { output } = currNeuron;

        let error = 0;
        if (lIndex === layers.length - 1) {
          error = (1 / 2) * (targets[nIndex] - output) ** 2;
        } else {
          const nextLayer = layers[lIndex + 1];
          error = currNeuron.weights.reduce((prev, curr, index) => prev + curr * nextLayer.neurons[index].delta, 0);
        }
        currNeuron.error = error;
        const delta = activationFunction.delta(error, output);
        currNeuron.delta = delta;
      }
    }
    console.log('FwPass', layers);
    return layers;
    // updateNetSettings({ layers });
  };

  makeBackwardPass = (layers) => {
    const { updateNetSettings, networkSettings } = this.props;
    // const layers = _.cloneDeep(networkSettings.layers);

    for (let lIndex = 1; lIndex <= layers.length - 1; lIndex += 1) {
      const prevLayer = layers[lIndex - 1];
      const currLayer = layers[lIndex];

      currLayer.neurons.forEach((currNeuron, nIndex) => {
        const { delta } = currNeuron;
        prevLayer.neurons.forEach((n) => {
          n.weights[nIndex] += networkSettings.learningRate * delta * n.output;
          // n.weights.forEach((w, i) => w += this.learningRate * delta * n.output);
        });
        // currNeuron.setBias(currNeuron.bias + this.learningRate * delta);
      });
    }
    console.log('BackPass', layers);
    return layers;

    // updateNetSettings({ layers });
  }

  startTraining = async () => {
    const { updateNetSettings, networkSettings, datasets } = this.props;
    const {
      layers, trainingSetId, testingSetId, epochCount,
    } = networkSettings;
    if (this.isNetworkReady()) {
      updateNetSettings({ state: 'training' });
      const trainingSet = datasets.find((ds) => ds.id === trainingSetId);
      const trainingSetData = trainingSet.data.map((obj) => Object.values(obj));
      const trainExpected = extractLastColumn(trainingSetData);
      const outputSize = _.uniq(trainExpected).sort().length;
      const normalizedTrainData = normalization.minMaxNegative(trainingSetData);
      const ctx = this.canvasRef.current.getContext('2d');

      let prevNetState; let forwardRes; let backwardRes; let costSum;
      const layersCount = layers.length - 1;
      // for (let epoch = 0; epoch < epochCount; epoch += 1) {
      //   costSum = 0;
      //   for (let i = 0; i < normalizedTrainData.length; i += 1) {
      //     const inputs = normalizedTrainData[i];
      //     i === 0 ? prevNetState = _.cloneDeep(layers) : prevNetState = _.cloneDeep(backwardRes);

      //     const targets = smallValuesArr(outputSize);
      //     targets[trainExpected[i]] = 0.99;

      //     forwardRes = this.makeForwardPass(inputs, targets, prevNetState);
      //     backwardRes = this.makeBackwardPass(forwardRes);

      //     const outputLayer = backwardRes[layersCount];
      //     const curTrainingSampleCost = outputLayer.neurons.reduce((prev, cur) => prev += cur.error, 0);
      //     costSum += curTrainingSampleCost;

      //     this.drawNetworkLayers(ctx, backwardRes);
      //   }
      //   costSum /= normalizedTrainData.length;
      //   console.log('Ошибка сети', costSum);
      // }

      const timer = (ms) => new Promise((res) => setTimeout(res, ms));

      for (let epoch = 0; epoch < epochCount; epoch += 1) {
        costSum = 0;
        for (let i = 0; i < normalizedTrainData.length; i += 1) {
          const inputs = normalizedTrainData[i];
          i === 0 ? prevNetState = _.cloneDeep(layers) : prevNetState = _.cloneDeep(backwardRes);

          const targets = smallValuesArr(outputSize);
          targets[trainExpected[i]] = 0.99;

          forwardRes = this.makeForwardPass(inputs, targets, prevNetState);
          backwardRes = this.makeBackwardPass(forwardRes);

          const outputLayer = backwardRes[layersCount];
          const curTrainingSampleCost = outputLayer.neurons.reduce((prev, cur) => prev += cur.error, 0);
          costSum += curTrainingSampleCost;

          this.drawNetworkLayers(ctx, backwardRes);
          await timer(50);
        }

        costSum /= (normalizedTrainData.length * 2);
        console.log('Ошибка сети', costSum);
      }

      const testingSet = datasets.find((ds) => ds.id === testingSetId);
      const testingSetData = testingSet.data.map((obj) => Object.values(obj));
      const testExpected = extractLastColumn(testingSetData);
      const normalizedTestData = normalization.minMaxNegative(testingSetData);

      let wrongCount = 0;
      normalizedTestData.forEach((datarow, i) => {
        backwardRes[0].neurons.forEach((n, i) => {
          n.output = datarow[i];
        });
        // run sigmoid
        for (let lIndex = 1; lIndex < backwardRes.length; lIndex += 1) {
          const layer = backwardRes[lIndex];
          for (let j = 0; j < layer.neurons.length; j += 1) {
            const neuron = layer.neurons[j];
            const b = neuron.bias;
            const connectionsValue = backwardRes[lIndex - 1].neurons.reduce((prev, curN) => prev + curN.weights[j] * curN.output, 0);
            const activationFunction = activations[networkSettings.activation];
            neuron.output = activationFunction.activate(b + connectionsValue);
          }
        }
        const outputLayer = backwardRes[layersCount];
        const result = outputLayer.neurons.map((n) => n.output);

        const maxVal = Math.max(...result);
        const prediction = result.indexOf(maxVal);
        const expected = testExpected[i];

        if (Number(prediction) !== Number(expected)) wrongCount += 1;
      });
      const accuracy = 100 - (wrongCount / testingSetData.length) * 100;
      console.log('Результат тестирования', { inputsCount: testingSetData.length, wrongCount, accuracy });

      updateNetSettings({ layers: backwardRes, testResults: { accuracy }, costSum });
    } else {
      console.log('error');
    }
  };

  isNetworkReady = () => {
    const { networkSettings } = this.props;
    const { trainingSetId, testingSetId } = networkSettings;

    if (trainingSetId && testingSetId) {
      return true;
    }
    return false;
  }

  render() {
    const {
      canvasSettings, uploadingSettings, addLayer, removeLayer, networkSettings,
    } = this.props;
    const { canvasWidth, canvasHeight } = canvasSettings;
    const { headers, skipEmptyLines } = uploadingSettings;

    return (
      <Grid container style={{ padding: 20 }} spacing={2}>
        <Grid item xs={4}>
          <FormControlLabel
            control={(
              <Checkbox
                color="primary"
                checked={headers}
                onChange={this.handleChangeHeaders}
              />
            )}
            label="Строка заголовка"
          />
          <FormControlLabel
            control={(
              <Checkbox
                color="primary"
                checked={skipEmptyLines}
                onChange={this.handleChangeSkipEmptyLines}
              />
            )}
            label="Пропускать пустые строки"
          />
          <Dropzone
            submitButtonContent="Загрузить"
            inputWithFilesContent="Добавить файлы"
            inputContent="Перетащите файлы или нажмите сюда"
            canCancel={false}
            onSubmit={this.handleSubmit}
            accept=".csv"
          />
          <br />
          <MultilayerNNSettings />
        </Grid>
        <Grid item xs={8}>
          <Paper elevation={1} />
          <br />
          <DatasetTabs />
        </Grid>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <IconButton aria-label="reset-training" color="primary">
              <ReplayRoundedIcon style={{ fontSize: 30 }} />
            </IconButton>
            <IconButton
              aria-label="start-training"
              color="primary"
              onClick={this.startTraining}
            >
              <PlayCircleFilledRoundedIcon style={{ fontSize: 40 }} />
            </IconButton>
          </Grid>
          <Grid item xs={2}>
            Функция потерь: {networkSettings.costSum}
          </Grid>
          <Grid item xs={2}>
            Точность на тестовом наборе: {networkSettings.testResults.accuracy.toFixed(2)} %
          </Grid>
          <Grid item xs={10}>
            <IconButton
              aria-label="add-layer"
              color="inherit"
              onClick={addLayer}
            >
              <AddRoundedIcon style={{ fontSize: 35 }} />
            </IconButton>
            <IconButton
              aria-label="remove-layer"
              color="inherit"
              onClick={removeLayer}
            >
              <RemoveRoundedIcon style={{ fontSize: 35 }} />
            </IconButton>
            Скрытые слои
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={2}>
            <canvas
              ref={this.canvasRef}
              width={canvasWidth}
              height={canvasHeight}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default connect(mapStateToProps, actionCreators)(MultilayerNN);
