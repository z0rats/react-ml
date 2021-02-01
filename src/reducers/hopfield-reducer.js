import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import * as actions from '../actions/hopfield-actions.js';

const createWeightsMatrix = (size) => {
  const w = [];
  for (let i = 0; i < size; i += 1) w[i] = new Array(size).fill(0);
  return w;
};

const canvasSettings = handleActions({
  [actions.updateCanvas](state, { payload }) {
    return { ...state, ...payload };
  },
}, {
  canvasWidth: 450,
  canvasHeight: 450,
  userImageData: null,
  netImageData: null,
  squareSize: 45,
  gridSize: 10,
  isDrawing: false
});

const networkSettings = handleActions({
  [actions.updateNetSettings](state, { payload }) {
    return { ...state, ...payload };
  },
  [actions.updateCurrentImageByIndex](state, { payload }) {
    const { id, newValue } = payload;
    return { ...state, currentImage: state.currentImage.map((curVal, index) => 
      index === id ? newValue : curVal)
    };
  },
}, {
  inputNodes: 100,
  currentImage: new Array(100).fill(-1),
  weights: createWeightsMatrix(100),
  netOutput: new Array(100).fill(-1)
});

export default combineReducers({
  canvasSettings,
  networkSettings
});