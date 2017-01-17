function invariant(cond : boolean, err : string) {
  if (!cond) throw new Error(err);
}

class Canvas {
  constructor(private ctx : CanvasRenderingContext2D) {}
  dot(x : number, y : number, color : string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }
}

class Vector2 {
  constructor(public x : number, public y : number) {}
}

class Vector3 {
  constructor(
    public x : number,
    public y : number,
    public z : number
  ) {}
  set (x : number, y : number, z : number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static add(a : Vector3, b : Vector3) : Vector3 {
    return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
  }
  static addIP(a : Vector3, b : Vector3, r : Vector3) {
    r.x = a.x + b.x;
    r.y = a.y + b.y;
    r.z = a.z + b.z;
  }
  static subtract(a : Vector3, b : Vector3) : Vector3 {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }
  static subtractIP(a : Vector3, b : Vector3, r : Vector3) {
    r.x = a.x - b.x;
    r.y = a.y - b.y;
    r.z = a.z - b.z;
  }
  static multiply(a : Vector3, b : number) : Vector3 {
    return new Vector3(a.x * b, a.y * b, a.z * b);
  }
  static divide(a : Vector3, b : number) : Vector3 {
    return new Vector3(a.x / b, a.y / b, a.z / b);
  }
  static divideIP(a : Vector3, b : number, r : Vector3) {
    r.x = a.x / b;
    r.y = a.y / b;
    r.z = a.z / b;
  }
  static dot(a : Vector3, b : Vector3) : number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
  static cross(a : Vector3, b : Vector3) : Vector3 {
    return new Vector3(
      a.y * b.z - a.z * b.y, 
      a.z * b.x - a.x * b.z, 
      a.x * b.y - a.y * b.x
    );
  }
  static crossIP(a : Vector3, b : Vector3, r : Vector3) {
    r.x = a.y * b.z - a.z * b.y;
    r.y = a.z * b.x - a.x * b.z;
    r.z = a.x * b.y - a.y * b.x;
  }
  static normalize(v : Vector3) : Vector3 {
    const d = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    return new Vector3(v.x / d, v.y / d, v.z / d);
  }
  static normalizeIP(v : Vector3, r : Vector3) {
    const d = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    r.x = v.x / d;
    r.y = v.y / d;
    r.z = v.z / d;
  }
}

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
  normal : Vector3
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
  projection(x : Vector3) : Vector3 {
    return new Vector3(
      Vector3.dot(this.side[0], Vector3.subtract(x, this.v[0])),
      Vector3.dot(this.side[1], Vector3.subtract(x, this.v[1])),
      Vector3.dot(this.side[2], Vector3.subtract(x, this.v[2]))
    );
  }
}

const DOMCanvas = document.getElementsByTagName('canvas')[0];
const ctx : CanvasRenderingContext2D | null = DOMCanvas.getContext('2d');

const triangle = new Triangle(
  new Vector3(0.0, 1.0, 0),
  new Vector3(-1, -1, 0),
  new Vector3(1, -1, 0)
);

if (ctx === null) {
  throw new Error('No context found');
}
else {
  const canvas = new Canvas(<CanvasRenderingContext2D> ctx);
  let color : Vector3 = new Vector3(0, 0, 0);
  for (let y = 0; y < 200; y++) {
    for (let x = 0; x < 200; x++) {
      pixel((x + 0.5 - 100) / 50, -(y + 0.5 - 100) / 50, color);
      canvas.dot(x, y, rgbString(color));
    }
  }
}
function pixel(x : number, y : number, c : Vector3) {
  const p : Vector3 = triangle.projection(new Vector3(x, y, 0.0));
  if (p.x > 0.0 && p.y > 0.0 && p.z > 0.0) {
    c.x = p.x * 255;
    c.y = p.y * 255;
    c.z = p.z * 255;
  }
  else {
    c.x = 0;
    c.y = 0;
    c.z = 0;
  }
}
function shader(uvw : Vector3, c : Vector3) {
}

function drawTriangle(
  canvas : Canvas,
  v0 : Vector2,
  v1 : Vector2,
  v2 : Vector2,
  color : Vector3
) {
  //let v : Vector2[] = [v0, v1, v2].sort((a, b) => a.y - b.y);
  //drawFlatBottomTriangle(canvas, v, color);
  //let v : Vector2[] = [v0, v1, v2].sort((a, b) => a.y - b.y);
  const v = [v0, v1, v2];
  console.log(v);
  drawFlatTopTriangle(canvas, v, color);
}

function drawFlatBottomTriangle(
  canvas : Canvas,
  v : Vector2[],
  color : Vector3
) {
  if (v.length !== 3) throw new Error('size invariant violation');

  const slope1 = (v[1].x - v[0].x) / (v[1].y - v[0].y);
  const slope2 = (v[2].x - v[0].x) / (v[2].y - v[0].y);

  if (v[1].y !== v[2].y) throw new Error('invariant violation');

  let x1 = v[0].x;
  let x2 = v[0].x;

  const du = 1.0 / (v[1].y - v[0].y);

  let u = 1.0;
  let b;
  let w;
  let c : Vector3 = new Vector3(0, 0, 0);

  for (let y = v[0].y; y <= v[1].y; y += 1) {
    for (let x = Math.floor(x1); x <= x2-1; x += 1) {
      const t = (x - x1) / (x2 - x1);
      b = t * (1.0 - u);
      w = (1.0 - t) * (1.0 - u);
      c.x = Math.floor(u * 255);
      c.y = Math.floor(b * 255);
      c.z = Math.floor(w * 255);
      canvas.dot(x, y, rgbString(c));
    }
    u -= du;
    x1 += slope1;
    x2 += slope2;
  }
}

function drawFlatTopTriangle(
  canvas : Canvas,
  v : Vector2[],
  color : Vector3
) {
  const slope1 = (v[2].x - v[1].x) / (v[2].y - v[1].y);
  const slope2 = (v[2].x - v[0].x) / (v[2].y - v[0].y);

  if (v[0].y !== v[1].y) throw new Error('invariant violation');

  let x1 = v[1].x;
  let x2 = v[0].x;

  for (let y = v[0].y; y <= v[2].y; y += 1) {
    for (let x = Math.floor(x1); x <= x2-1; x += 1) {
      canvas.dot(x, y, rgbString(color));
    }
    x1 += slope1;
    x2 += slope2;
  }
}



function drawLine(canvas : Canvas, v0 : Vector2, v1 : Vector2, color : Vector3) {
  let steep = false;
  let x0 = v0.x;
  let x1 = v1.x;
  let y0 = v0.y;
  let y1 = v1.y;

  if (Math.abs(x1-x0) < Math.abs(y1-y0)) {
    steep = true;
    [x0, y0] = [y0, x0];
    [x1, y1] = [y1, x1];
  }

  const dx = x1 - x0;
  const d = 1 / dx;
  let t = 0;

  for (let x = x0; x < x1; x++) {
    t = t + d;

    const y = y0 * (1.0 - t) + y1 * t + 0.5;
    if (steep) {
      canvas.dot(y, x, rgbString(color));
    }
    else {
      canvas.dot(x, y, rgbString(color));
    }
  }
}

function rgbString(color : Vector3) : string {
  return `rgb(${Math.floor(color.x)},${Math.floor(color.y)},${Math.floor(color.z)})`;
}
