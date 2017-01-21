import Vector3 from './Vector3';

export default class Triangle {
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
