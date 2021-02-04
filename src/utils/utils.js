export const randomInRange = (min, max) => Math.random() * (max - min) + min;

export const generateWeights = (length) => {
  const w = [];
  for (let i = 0; i < length; i += 1) {
    const value = randomInRange(-0.1, 0.1);
    w.push(value);
  }
  return w;
};

export const smallValuesArr = (len) => new Array(len).fill(0.01);

export const transpose = (arr) => arr[0].map((_, colIndex) => arr.map((row) => row[colIndex]));

export const extractFirstColumn = (data) => {
  const column = [];
  data.forEach((row) => {
    column.push(...row.splice(0, 1));
  });
  return column;
};

export const extractLastColumn = (data) => {
  const column = [];
  data.forEach((row) => {
    column.push(...row.splice(-1));
  });
  return column;
};
