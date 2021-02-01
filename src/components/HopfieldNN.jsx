import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions/hopfield-actions.js';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';

import _ from 'lodash';

const mapStateToProps = (state) => {
  const { networkSettings, canvasSettings } = state.hopfield;
  return { networkSettings, canvasSettings };
};

const actionCreators = {
  updateCurrentImageByIndex: actions.updateCurrentImageByIndex,
  updateNetSettings: actions.updateNetSettings,
  updateCanvas: actions.updateCanvas,
};

const indexFitsInArrayLength = (index, len) => index < len && index >= 0;

const calcIndex = (x, y, size) => x + y * size;

const getNewSquareCoords = (ref, clientX, clientY, size) => {
  const rect = ref.current.getBoundingClientRect();
  const x = Math.ceil((clientX - rect.left) / size) - 1;
  const y = Math.ceil((clientY - rect.top) / size) - 1;
  return { x, y };
}

const createWeightsMatrix = (size) => {
  let w = [];
  for (let i = 0; i < size; i += 1) 
    w[i] = new Array(size).fill(0);
  return w;
}

class HopfieldNet extends Component {
  userCanvasRef = React.createRef();
  netCanvasRef = React.createRef();
  
  componentDidMount() {
    const { canvasSettings, updateCanvas } = this.props;
    const { userImageData, netImageData, canvasWidth, canvasHeight } = canvasSettings;
    
    const userContext = this.userCanvasRef.current.getContext('2d');
    const netContext = this.netCanvasRef.current.getContext('2d');
    if (_.isNull(userImageData) || _.isNull(netImageData)) {
      this.drawGrid(userContext);
      this.drawGrid(netContext);
    } else {
      userContext.putImageData(userImageData, 0, 0);
      netContext.putImageData(netImageData, 0, 0);
    }
    const uImageData = userContext.getImageData(0, 0, canvasWidth, canvasHeight);
    const nImageData = netContext.getImageData(0, 0, canvasWidth, canvasHeight);
    updateCanvas({ userImageData: uImageData, netImageData: nImageData });
  }

  drawGrid = (ctx) => {
    const { gridSize, squareSize, canvasWidth, canvasHeight } = this.props.canvasSettings;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    for (let row = 0; row < gridSize; row += 1) {
      for (let column = 0; column < gridSize; column += 1) {
        let x = column * squareSize;
        let y = row * squareSize;
        ctx.rect(x, y, squareSize, squareSize);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.closePath();
  }

  handleMouseDown = (e) => {
    const { networkSettings, canvasSettings, updateCanvas, updateCurrentImageByIndex } = this.props;
    const { gridSize, squareSize, canvasWidth, canvasHeight } = canvasSettings;
    const { inputNodes, currentImage } = networkSettings;

    const { offsetX, offsetY } = e.nativeEvent;
    const userContext = this.userCanvasRef.current.getContext('2d');
    userContext.fillStyle = "black";
    userContext.fillRect(
          Math.floor(offsetX / squareSize) * squareSize, 
          Math.floor(offsetY / squareSize) * squareSize,
          squareSize, squareSize);
    const imageData = userContext.getImageData(0, 0, canvasWidth, canvasHeight);
    updateCanvas({ userImageData: imageData, isDrawing: true });

    const { clientX, clientY } = e;
    const coords = getNewSquareCoords(this.userCanvasRef, clientX, clientY, squareSize);
    const index = calcIndex(coords.x, coords.y, gridSize);
    if (indexFitsInArrayLength(index, inputNodes) && currentImage[index] !== 1) {
      updateCurrentImageByIndex({ id: index, newValue: 1 });
    }
  }

  handleMouseMove = (e) => {
    const { networkSettings, canvasSettings, updateCanvas, updateCurrentImageByIndex } = this.props;
    const { isDrawing, gridSize, squareSize, canvasWidth, canvasHeight } = canvasSettings;
    const { currentImage, inputNodes } = networkSettings;
    
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const userContext = this.userCanvasRef.current.getContext('2d');
    userContext.fillStyle = "black";
    userContext.fillRect(
        Math.floor(offsetX / squareSize) * squareSize, 
        Math.floor(offsetY / squareSize) * squareSize,
        squareSize, squareSize);

    const { clientX, clientY } = e;
    const coords = getNewSquareCoords(this.userCanvasRef, clientX, clientY, squareSize);
    const index = calcIndex(coords.x, coords.y, gridSize);
    if (indexFitsInArrayLength(index, inputNodes) && currentImage[index] !== 1) {
      updateCurrentImageByIndex({ id: index, newValue: 1 });
      const imageData = userContext.getImageData(0, 0, canvasWidth, canvasHeight);
      updateCanvas({ userImageData: imageData });
    }
  }

  stopDrawing = () => {
    const { updateCanvas } = this.props;
    updateCanvas({ isDrawing: false });
  }

  clearCurrentImage = () => {
    const userContext = this.userCanvasRef.current.getContext('2d');
    this.drawGrid(userContext);

    const { updateNetSettings, canvasSettings } = this.props;
    const { gridSize } = canvasSettings;
    updateNetSettings({
      currentImage: new Array(gridSize * gridSize).fill(-1)
    });
  }

  changeNetConfig = (e, newSize) => {
    const { updateCanvas, updateNetSettings } = this.props;
    const { squareSize } = this.props.canvasSettings;
    updateCanvas({
      gridSize: newSize,
      canvasWidth: newSize * squareSize,
      canvasHeight: newSize * squareSize
    });
    updateNetSettings({
      inputNodes: newSize * newSize,
      currentImage: new Array(newSize * newSize).fill(-1),
      netOutput: new Array(newSize * newSize).fill(-1)
    });

    this.redrawGrids();
    this.configWeights();
  }

  redrawGrids = () => {
    const userContext = this.userCanvasRef.current.getContext('2d');
    const netContext = this.netCanvasRef.current.getContext('2d');    
    this.drawGrid(userContext);
    this.drawGrid(netContext);
  }

  configWeights = () => {
    const { updateNetSettings } = this.props;
    const { inputNodes } = this.props.networkSettings;
    updateNetSettings({
      weights: createWeightsMatrix(inputNodes)
    });
  }

  updateWeights = () => {
    const { updateNetSettings, networkSettings } = this.props;
    const { weights, currentImage } = networkSettings;
    const newWeights = [...weights].map((nested, i) =>
      nested.map((w, j) => {
        if (i === j) w = 0;
        else w += currentImage[i] * currentImage[j];
        return w;
      })
    );

    updateNetSettings({ weights: newWeights });
  }

  recognizeSignal = () => {
    const { updateNetSettings, networkSettings } = this.props;
    const { weights, currentImage } = networkSettings;
    
    let prevNetState;
    let currNetState;
    do {
      currNetState = weights.map((nested) => {
        const sum = nested.reduce((prev, cur, j) => prev + cur * currentImage[j]);
        return sum >= 0 ? 1 : -1; 
      });
      prevNetState = [...currNetState];
    } while (!_.isEqual(currNetState, prevNetState));
    
    const context = this.netCanvasRef.current.getContext('2d');
    this.drawFromArray(currNetState, context);
    
    updateNetSettings({ netOutput: currNetState });
  }

  drawFromArray = (data, ctx) => {
    const { canvasSettings, updateCanvas } = this.props;
    const { gridSize, squareSize } = canvasSettings;
    const twoDimData = [];
    while(data.length) twoDimData.push(data.splice(0, gridSize));

    this.drawGrid(ctx);
    ctx.fillStyle = "black";

    for (let i = 0; i < gridSize; i += 1) {
      for (let j = 0; j < gridSize; j += 1) {
        if (twoDimData[i][j] === 1) {
          ctx.fillRect((j * squareSize), (i * squareSize), squareSize, squareSize);
        }
      }
    }

    updateCanvas({ netContextRedux: ctx });
  }

  render() {
    const {canvasWidth, canvasHeight, gridSize } = this.props.canvasSettings;

    return (
      <div style = {{ paddingTop: 15 }}>
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs = {5}>
            <canvas 
              ref={this.userCanvasRef} 
              width={canvasWidth}
              height={canvasHeight} 
              onMouseDown={this.handleMouseDown}
              onMouseMove={this.handleMouseMove}
              onMouseUp={this.stopDrawing}
              onMouseLeave={this.stopDrawing}
            />          
          </Grid>
          <Grid item xs = {2} >
            <Typography id="discrete-slider" paragraph>
              Размер сетки
            </Typography>
            <Slider
              defaultValue={gridSize}
              onChangeCommitted={this.changeNetConfig}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={3}
              max={12}
            />
          </Grid>
          <Grid item xs = {5}>
            <canvas 
              ref={this.netCanvasRef}
              width={canvasWidth}
              height={canvasHeight}
            />
          </Grid>
        </Grid>
        <Grid container justify="space-evenly" style = {{ padding: 15 }} item xs = {5}>
          <Button
            color="primary"
            variant="contained"
            onClick={this.updateWeights}
          >
            Запомнить образ
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={this.clearCurrentImage}
          >
            Очистить сетку
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={this.recognizeSignal}
          >
            Распознать образ
          </Button>
        </Grid>
      </div>
    )
  }  
};

export default connect(mapStateToProps, actionCreators)(HopfieldNet);
