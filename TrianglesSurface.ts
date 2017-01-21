import ShaderInterface from './ShaderInterface';
import Vector3 from './Vector3';
import Triangle from './Triangle';

export class RaycastResult {
  hit: boolean = false;
  color: Vector3 = new Vector3();
  depth: number = 0.0;
  constructor() {}
}

// temporary variable object used to avoid repeated allocation
export class RaycastVars {
  calcA : Vector3 = new Vector3();
  calcB : Vector3 = new Vector3();
  calcC : Vector3 = new Vector3();
}

interface SurfaceInterface {
  ray(start : Vector3, end : Vector3, vars : RaycastVars, res : RaycastResult) : void;
}

export class TrianglesSurface implements SurfaceInterface {
  constructor(
    public triangles : Triangle[],
    public shader : ShaderInterface
  ) {}
  ray(start : Vector3, end : Vector3, vars : RaycastVars, res : RaycastResult) : void {
    var depth = Infinity;

    var tri : Triangle;

    var startProj : number;
    var endProj : number;

    res.hit = false;

    var i;
    for (i = 0; i < this.triangles.length; i++) {
      tri = this.triangles[i];

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
