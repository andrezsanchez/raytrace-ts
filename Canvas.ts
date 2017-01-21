import Vector3 from './Vector3';

function rgbString(color : Vector3) : string {
  return 'rgb(' + Math.floor(color.x) + ',' + Math.floor(color.y) + ',' + Math.floor(color.z) + ')';
}

export default class Canvas {
  constructor(private ctx : CanvasRenderingContext2D) {}
  dot(x : number, y : number, color : Vector3) {
    this.ctx.fillStyle = rgbString(color);
    this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
}
