import { createAction } from 'redux-actions';

export const updateCanvas = createAction('UPDATE_HOPFIELD_CANVAS');
export const updateNetSettings = createAction('UPDATE_HOPFIELD_NET');
export const updateCurrentImageByIndex = createAction('UPDATE_CURRENT_IMAGE');