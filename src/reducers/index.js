import { combineReducers } from 'redux';
import hopfieldReducer from './hopfield-reducer.js';
import mnnReducer from './mnn-reducer.js';

export default combineReducers({
  hopfield: hopfieldReducer,
  mnn: mnnReducer,
});
