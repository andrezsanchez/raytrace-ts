'use strict';

class Canvas {
  constructor(ctx) {
    this.ctx = ctx;
  }
  dot(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
}

const DOMCanvas = document.getElementsByTagName('canvas')[0];
const canvas = new Canvas(DOMCanvas.getContext('2d'));

drawLine(10, 10, 40, 9)

function drawLine(x0, y0, x1, y1, color) {
  let steep = false;
  if (Math.abs(x1-x0) < Math.abs(y1-y0)) {
    steep = true;
    let temp
    temp = x0
    x0 = y0
    y0 = temp
    temp = x1
    x1 = y1
    y1 = temp
  }

  const dx = x1 - x0;
  const d = 1 / dx;
  let t = 0;

  for (let x = x0; x < x1; x++) {
    t = t + d;

    const y = y0 * (1.0 - t) + y1 * t + 0.5;
    if (steep) {
      canvas.dot(y, x, 'rgb(255, 0, 0)');
    }
    else {
      canvas.dot(x, y, 'rgb(255, 0, 0)');
    }
  }
}

function rgbString(r, g, b) {
  return `rgb(${r},${g},${b})`;
}
