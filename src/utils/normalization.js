import { transpose } from './utils.js';

const normalization = {
  minMax: (data) => {
    const normalised = [];
    const transposed = transpose(data);
    const { length } = transposed;
    for (let i = 0; i < length; i += 1) {
      const maxEl = Math.max(...transposed[i]);
      const minEl = Math.min(...transposed[i]);

      for (let j = 0; j < transposed[i].length; j += 1) {
        // normalization range [0; 1]
        transposed[i][j] = (transposed[i][j] - minEl) / (maxEl - minEl);
      }
      normalised.push(transposed[i]);
    }
    return transpose(normalised);
  },
  minMaxNegative: (data) => {
    const normalised = [];
    const transposed = transpose(data);
    const { length } = transposed;
    for (let i = 0; i < length; i += 1) {
      const maxEl = Math.max(...transposed[i]);
      const minEl = Math.min(...transposed[i]);

      for (let j = 0; j < transposed[i].length; j += 1) {
        // normalization range [-1; 1] 
        transposed[i][j] = (transposed[i][j] - 0.5 * (maxEl + minEl)) / (0.5 * (maxEl - minEl));
      }
      normalised.push(transposed[i]);
    }
    return transpose(normalised);
  }
}

export default normalization;
