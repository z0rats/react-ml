import _ from 'lodash';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import * as actions from '../actions/mnn-actions.js';
import { generateWeights } from '../utils/utils.js';

const updateWeights = (layerId, layers) => {
  const startLayer = layerId === 0 ? 0 : layerId - 1;

  for (let lIndex = startLayer; lIndex < layers.length; lIndex += 1) {
    const layer = layers[lIndex];
    let numOfWeights = 0;
    if (lIndex < layers.length - 1) {
      numOfWeights = layers[lIndex + 1].neurons.length;
    }
    layer.neurons.forEach((n) => {
      const newWeights = generateWeights(numOfWeights);
      n.weights = newWeights;
    });
  }

  return layers;
};

const neuronPattern = {
  weights: [],
  bias: 0,
  delta: 0,
  output: 0,
  error: 0,
};

const layerPattern = {
  neurons: [
    { ...neuronPattern },
    { ...neuronPattern },
    { ...neuronPattern },
  ],
};

const mnnInitialState = {
  layers: [
    {
      neurons: [
        {
          weights: generateWeights(1),
          bias: 0,
          delta: 0,
          output: 0,
          error: 0,
        },
      ],
    },
    {
      neurons: [
        {
          weights: generateWeights(0),
          bias: 0,
          delta: 0,
          output: 0,
          error: 0,
        },
      ],
    },
  ],
  inputSize: 1,
  outputSize: 1,
  minLayers: 2,
  maxLayers: 7,
  minNeuronsInLayer: 1,
  maxNeuronsInLayer: 6,
  activation: 'th',
  epochCount: 1,
  learningRate: 0.1,
  costSum: 0,
  testResults: {
    accuracy: 0,
  },
  useBias: false,
  trainingSetId: '',
  testingSetId: '',
  state: 'configuring',
};

const canvasSettings = handleActions({
  [actions.updateCanvas](state, { payload }) {
    return { ...state, ...payload };
  },
}, {
  canvasContextRedux: null,
  canvasImageData: null,
  canvasWidth: 1400,
  canvasHeight: 600,
  inputDotRadius: 10,
  neuronRadius: 25,
  paddingX: 6.5,
  paddingY: 3.5,
});

const networkSettings = handleActions({
  [actions.updateNetSettings](state, { payload }) {
    return { ...state, ...payload };
  },
  [actions.addLayer](state) {
    const { layers, maxLayers } = state;

    const layersCount = layers.length;
    if (layersCount < maxLayers) {
      const lastIndex = layersCount - 1;
      const layersCopy = _.cloneDeep(layers);
      layersCopy.splice(lastIndex, 0, layerPattern);

      const newLayers = updateWeights(lastIndex - 1, layersCopy);

      return { ...state, layers: newLayers };
    }
    return state;
  },
  [actions.removeLayer](state) {
    const { layers, minLayers } = state;

    const layersCount = layers.length;
    if (layersCount > minLayers) {
      const beforeLastIndex = layersCount - 2;
      const layersCopy = _.cloneDeep(layers);
      layersCopy.splice(beforeLastIndex, 1);

      const newLayers = updateWeights(beforeLastIndex - 1, layersCopy);

      return { ...state, layers: newLayers };
    }
    return state;
  },
  [actions.addNeuron](state, { payload }) {
    const { layerId } = payload;
    const layersCopy = _.cloneDeep(state.layers);
    layersCopy[layerId].neurons.push(neuronPattern);

    const newLayers = updateWeights(layerId, layersCopy);

    return { ...state, layers: newLayers };
  },
  [actions.removeNeuron](state, { payload }) {
    const { layerId } = payload;
    const layersCopy = _.cloneDeep(state.layers);
    layersCopy[layerId].neurons.splice(-1, 1);

    const newLayers = updateWeights(layerId, layersCopy);

    return { ...state, layers: newLayers };
  },
}, mnnInitialState);

const datasets = handleActions({
  [actions.addDataset](state, { payload: { dataset } }) {
    return [...state, dataset];
  },
  [actions.deleteDataset](state, { payload: { id } }) {
    return state.filter((ds, i) => i !== id);
  },
}, []);

const uploadingSettings = handleActions({
  [actions.changeUploadingSettings](state, { payload }) {
    return { ...state, ...payload };
  },
}, {
  headers: true,
  skipEmptyLines: true,
});

const trainingSetSelector = handleActions({
  [actions.changeTrainSetSelector](state, { payload: { id } }) {
    return id;
  },
}, '');

const testingSetSelector = handleActions({
  [actions.changeTestSetSelector](state, { payload: { id } }) {
    return id;
  },
}, '');

const activeTableView = handleActions({
  [actions.changeActiveTableView](state, { payload: { tableId } }) {
    return tableId;
  },
}, 0);

const dataSettings = handleActions({
  [actions.changeDataSettings](state, { payload }) {
    return { ...state, ...payload };
  },
}, {
  normalization: 'minMaxNegative',
  trainingSize: 0.8,
  shuffleRows: true,
});

const snackbar = handleActions({
  [actions.setSnackbar](state, { payload }) {
    return { ...state, ...payload };
  },
}, {
  snackbarOpen: false,
  snackbarType: 'info',
  snackbarMsg: '',
});

export default combineReducers({
  activeTableView,
  datasets,
  dataSettings,
  canvasSettings,
  networkSettings,
  snackbar,
  trainingSetSelector,
  testingSetSelector,
  uploadingSettings,
});
