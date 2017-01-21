function invariant(cond : boolean, err : string) {
  if (!cond) throw new Error(err);
}

function rgbString(color : Vector3) : string {
  return 'rgb(' + Math.floor(color.x) + ',' + Math.floor(color.y) + ',' + Math.floor(color.z) + ')';
}

class Canvas {
  constructor(private ctx : CanvasRenderingContext2D) {}
  dot(x : number, y : number, color : Vector3) {
    this.ctx.fillStyle = rgbString(color);
    this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
}

class Vector2 {
  constructor(public x : number, public y : number) {}
}

import Vector3 from './Vector3';
import Triangle from './Triangle';

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

interface Shader {
  (uvw : Vector3, c : Vector3) : void;
};

class RaycastResult {
  hit: boolean = false;
  color: Vector3 = new Vector3();
  depth: number = 0.0;
  constructor() {}
}

class RaycastVars {
  calcA : Vector3 = new Vector3();
  calcB : Vector3 = new Vector3();
  calcC : Vector3 = new Vector3();
  //uvw : Vector3 = new Vector3();
}

interface SurfaceInterface {
  ray(start : Vector3, end : Vector3, vars : RaycastVars, res : RaycastResult) : void;
}

class TrianglesSurface implements SurfaceInterface {
  constructor(
    public triangles : Triangle[],
    public shader : Shader
  ) {}
  ray(start : Vector3, end : Vector3, vars : RaycastVars, res : RaycastResult) : void {
    //const uvw : Vector3 = new Vector3();
    //const position : Vector3 = new Vector3();

    var depth = Infinity;

    var tri : Triangle;

    var startProj : number;
    var endProj : number;
    //let difference : Vector3 = new Vector3();

    //let calcA : Vector3 = new Vector3();
    //let calcB : Vector3 = new Vector3();

    res.hit = false;

    var i;
    for (i = 0; i < this.triangles.length; i++) {
      tri = this.triangles[i];

      //position.set(x, y, 0);
      Vector3.subtractIP(start, tri.v[0], vars.calcA);
      startProj = Vector3.dot(tri.normal, vars.calcA);

      Vector3.subtractIP(end, tri.v[0], vars.calcA);
      endProj = Vector3.dot(tri.normal, vars.calcA);

      if (startProj <= 0.0 || endProj > 0.0) continue;

      var l : number = startProj - endProj;
      if (l < Number.EPSILON) continue;

      var t : number = startProj / l;

      var position = vars.calcC;
      Vector3.multiplyIP(start, 1 - t, vars.calcA);
      Vector3.multiplyIP(end, t, vars.calcB);
      Vector3.addIP(vars.calcA, vars.calcB, position);

      var uvw = vars.calcA;
      tri.baryProjection(position, uvw);

      if (uvw.x > 0.0 && uvw.y > 0.0 && uvw.z > 0.0) {
        res.hit = true;
        res.depth = t;
        this.shader(uvw, res.color);
        return;
      }
    }
  }
}

const shaders : Shader[] = [
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

  //let rayStart : Vector3 = new Vector3();
  //let rayEnd : Vector3 = new Vector3();

  let depth = Infinity;
  //let res : RaycastResult = new RaycastResult();
  let s : SurfaceInterface;

  for (let i = 0; i < surfaces.length; i++) {
    s = surfaces[i];
  //surfaces.forEach((s : SurfaceInterface) => {
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
  //});
}
