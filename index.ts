function invariant(cond : boolean, err : string) {
  if (!cond) throw new Error(err);
}

class Vector2 {
  constructor(public x : number, public y : number) {}
}
import Canvas from './Canvas';
import Vector3 from './Vector3';
import Triangle from './Triangle';
import { RaycastResult, RaycastVars, TrianglesSurface } from './TrianglesSurface';
import ShaderInterface from './ShaderInterface';

class Vector4 {
  constructor(
    public x : number,
    public y : number,
    public z : number,
    public w : number
  ) {}
}

class Mat4 {
  data : number[] = Array(16);
  constructor() {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.data[r * 4 + c] = r === c ? 1 : 0;
      }
    }
  }
}

const triangle : Triangle[] = [
  new Triangle(
    new Vector3(0.0, 1.0, 0),
    new Vector3(-1, -1, -0.1),
    new Vector3(1, -1.1, -0.1)
  ),
  new Triangle(
    new Vector3(0.7, 0.9, 0.2),
    new Vector3(-1, 0.2, -0.2),
    new Vector3(0, -1.4, 0)
  ),
  new Triangle(
    new Vector3(-0.3, 0.8, 0.7),
    new Vector3(0.2, -1.4, -0.5),
    new Vector3(0.8, 0.1, -0.1)
  ),
];


const shaders : ShaderInterface[] = [
  (uvw : Vector3, c : Vector3) => {c.set(255, 0, 0);},
  (uvw : Vector3, c : Vector3) => {
    if (Math.sin(uvw.x * 100) > 0) {
      c.set(0, 250, 0);
    }
    else {
      c.set(0, 100, 50);
    }
  },
  (uvw : Vector3, c : Vector3) => {
    const x = (uvw.y - 0.25) * 50000;
    const y = (uvw.z - 0.25) * 50000;
    const d = Math.sin(Math.sqrt(x*x + y*y));
    if (d > 0.5) {
      c.set(255, 255, 255);
    }
    else {
      c.set(0, 0, 0);
    }
  }
];

class PixelVars {
  raycastVars : RaycastVars = new RaycastVars();
  raycastRes : RaycastResult = new RaycastResult();
  rayStart : Vector3 = new Vector3();
  rayEnd : Vector3 = new Vector3();
  constructor() {}
}

const surfaces : TrianglesSurface[] = [
  new TrianglesSurface([triangle[0]], shaders[0]),
  new TrianglesSurface([triangle[1]], shaders[1]),
  new TrianglesSurface([triangle[2]], shaders[2])
];

const width = 512;
const height = 512;

const DOMCanvas : HTMLCanvasElement = document.getElementsByTagName('canvas')[0];
const ctx : CanvasRenderingContext2D | null = DOMCanvas.getContext('2d');

const offScreenCanvas : HTMLCanvasElement = document.createElement('canvas');
offScreenCanvas.width = width;
offScreenCanvas.height = height;

if (ctx === null) {
  throw new Error('No context found');
}
else {
  const canvas = new Canvas(<CanvasRenderingContext2D> offScreenCanvas.getContext('2d'));
  //const canvas = new Canvas(<CanvasRenderingContext2D> ctx);
  let color : Vector3 = new Vector3(0, 0, 0);
  let finalColor : Vector3 = new Vector3(0, 0, 0);

  const widthD2 = width / 2;
  const heightD2 = height / 2;
  const xRatio = 4 / width;
  const yRatio = 4 / height;

  const subsampleResolution = 2;
  const subsampleResolutionD2 = subsampleResolution / 2;
  const ssBlocks = subsampleResolution ** 2;

  const pixelVars : PixelVars = new PixelVars();

  let startTime = Date.now();
  for (let y = 0.5; y < height; y++) {
    for (let x = 0.5; x < width; x++) {
      finalColor.set(0, 0, 0);

      for (let subY = 0.5; subY < subsampleResolution; subY++) {
        for (let subX = 0.5; subX < subsampleResolution; subX++) {
          const xOffset = (subX - subsampleResolutionD2) / subsampleResolution;
          const yOffset = (subY - subsampleResolutionD2) / subsampleResolution;
          pixel(
            (x + xOffset - widthD2) * xRatio,
            -(y + yOffset - heightD2) * yRatio,
            pixelVars, color);
          Vector3.divideIP(color, ssBlocks, color);
          Vector3.addIP(finalColor, color, finalColor);
        }
      }

      canvas.dot(x, y, finalColor);
    }
  }
  console.log(Date.now() - startTime);

  ctx.drawImage(offScreenCanvas, 0, 0);
}

function pixel(x : number, y : number, vars : PixelVars, c : Vector3) {
  c.x = 20;
  c.y = 20;
  c.z = 20;

  let depth = Infinity;
  let s : TrianglesSurface;

  for (let i = 0; i < surfaces.length; i++) {
    s = surfaces[i];
    vars.rayStart.set(x, y, 100);
    vars.rayEnd.set(x, y, -100);

    s.ray(vars.rayStart, vars.rayEnd, vars.raycastVars, vars.raycastRes);

    if (vars.raycastRes.hit) {
      if (vars.raycastRes.depth < depth) {
        depth = vars.raycastRes.depth;
        vars.raycastRes.color.copyTo(c);
      }
    }
  }
}
