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

class Vector4 {
  constructor(
    public x : number,
    public y : number,
    public z : number,
    public w : number
  ) {}
}

class Triangle {
  v : Vector3[];
  normal : Vector3;
  side : Vector3[] = new Array(3);
  constructor(
    a : Vector3,
    b : Vector3,
    c : Vector3
  ) {
    this.v = [a, b, c];

    this.normal = Vector3.cross(
      Vector3.subtract(this.v[1], this.v[0]),
      Vector3.subtract(this.v[2], this.v[0])
    );
     
    Vector3.normalizeIP(this.normal, this.normal);

    for (let i = 0; i < 3; i++) {
      this.side[i] = Vector3.cross(
        this.normal,
        Vector3.subtract(this.v[(i + 1) % 3], this.v[i])
      );

      const dist : number = Vector3.dot(
        this.side[i],
        Vector3.subtract(this.v[(i + 2) % 3], this.v[i])
      );
      Vector3.divideIP(this.side[i], dist, this.side[i]);
    }
  }
  baryProjection(x : Vector3, r : Vector3) {
    r.set(
      Vector3.dot(this.side[0], Vector3.subtract(x, this.v[0])),
      Vector3.dot(this.side[1], Vector3.subtract(x, this.v[1])),
      Vector3.dot(this.side[2], Vector3.subtract(x, this.v[2]))
    );
  }
  baryToVector(uvw : Vector3, r : Vector3) {
    Vector3.addIP(
      Vector3.multiply(this.v[2], uvw.x),
      Vector3.multiply(this.v[0], uvw.y),
      r
    );

    Vector3.addIP(r, Vector3.multiply(this.v[1], uvw.z), r);
  }
}

//class Surface {
  //constructor
//};

const DOMCanvas = document.getElementsByTagName('canvas')[0];
const ctx : CanvasRenderingContext2D | null = DOMCanvas.getContext('2d');

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


if (ctx === null) {
  throw new Error('No context found');
}
else {
  const canvas = new Canvas(<CanvasRenderingContext2D> ctx);
  let color : Vector3 = new Vector3(0, 0, 0);
  let finalColor : Vector3 = new Vector3(0, 0, 0);

  const width = 512;
  const height = 512;
  const widthD2 = width / 2;
  const heightD2 = height / 2;
  const xRatio = 4 / width;
  const yRatio = 4 / height;

  const subsampleResolution = 2;
  const subsampleResolutionD2 = subsampleResolution / 2;
  const ssBlocks = subsampleResolution ** 2;

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
            -(y + yOffset - heightD2) * yRatio, color);
          Vector3.divideIP(color, ssBlocks, color);
          Vector3.addIP(finalColor, color, finalColor);
        }
      }

      canvas.dot(x, y, finalColor);
    }
  }
  console.log(Date.now() - startTime);
}


function pixel(x : number, y : number, c : Vector3) {
  c.x = 20;
  c.y = 20;
  c.z = 20;

  let uvw : Vector3 = new Vector3();
  let position : Vector3 = new Vector3();

  let z = -Infinity;

  let t : Triangle;
  let shader : Shader;
  for (let i = 0; i < triangle.length; i++) {
    t = triangle[i];
    shader = shaders[i];

    position.set(x, y, 0);

    t.baryProjection(position, uvw);

    if (uvw.x > 0.0 && uvw.y > 0.0 && uvw.z > 0.0) {
      t.baryToVector(uvw, position);

      if (position.z > z) {
        z = position.z;
        shader(uvw, c);
      }
    }
  }
}
