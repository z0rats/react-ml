// @ts-check

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import './css/index.css';
import reducers from './reducers/index.js';
import App from './components/App.jsx';

const store = createStore(reducers, composeWithDevTools());

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
