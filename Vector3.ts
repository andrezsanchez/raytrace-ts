export default class Vector3 {
  constructor(
    public x : number = 0,
    public y : number = 0,
    public z : number = 0
  ) {}
  set (x : number, y : number, z : number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  copy() : Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }
  copyTo(v : Vector3) {
    v.x = this.x;
    v.y = this.y;
    v.z = this.z;
  }
  static add(a : Vector3, b : Vector3) : Vector3 {
    return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
  }
  static addIP(a : Vector3, b : Vector3, r : Vector3) {
    r.x = a.x + b.x;
    r.y = a.y + b.y;
    r.z = a.z + b.z;
  }
  add(v : Vector3) : void {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }
  static subtract(a : Vector3, b : Vector3) : Vector3 {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }
  static subtractIP(a : Vector3, b : Vector3, r : Vector3) {
    r.x = a.x - b.x;
    r.y = a.y - b.y;
    r.z = a.z - b.z;
  }
  subtract(v : Vector3) : void {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
  }
  static multiply(a : Vector3, b : number) : Vector3 {
    return new Vector3(a.x * b, a.y * b, a.z * b);
  }
  static multiplyIP(a : Vector3, b : number, r : Vector3) {
    r.x = a.x * b;
    r.y = a.y * b;
    r.z = a.z * b;
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
