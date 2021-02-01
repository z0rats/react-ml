import { createAction } from 'redux-actions';

export const updateCanvas = createAction('UPDATE_MNN_CANVAS');
export const updateNetSettings = createAction('UPDATE_MNN_SETTINGS');
export const addLayer = createAction('ADD_LAYER');
export const removeLayer  = createAction('REMOVE_LAYER');
// export const updateLayer = createAction('UPDATE_LAYER');
export const addNeuron = createAction('ADD_NEURON');
export const removeNeuron = createAction('REMOVE_NEURON');
export const changeDataSettings = createAction('DATA_SETTINGS_CHANGE');

export const changeActiveTableView = createAction('ACTIVE_TABLE_VIEW_CHANGE');
export const changeTrainSetSelector = createAction('CHANGE_LR_SET');
export const changeTestSetSelector = createAction('CHANGE_TEST_SET');
export const changeUploadingSettings = createAction('CHANGE_UPLOADING_SETTINGS');

export const addDataset = createAction('DATASET_ADD');
export const updateDataset = createAction('DATASET_UPDATE');
export const deleteDataset = createAction('DATASET_DELETE');

export const setSnackbar = createAction('SET_SNACKBAR');
