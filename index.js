class Canvas {
    constructor(ctx) {
        this.ctx = ctx;
    }
    dot(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
}
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
}
class Vector4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}
const DOMCanvas = document.getElementsByTagName('canvas')[0];
const ctx = DOMCanvas.getContext('2d');
if (ctx === null) {
    throw new Error('No context found');
}
else {
    const canvas = new Canvas(ctx);
    //drawLine(canvas, new Vector2(10, 10), new Vector2(40, 19), new Vector3(255, 0, 0));
    //drawLine(canvas, new Vector2(10, 10), new Vector2(30, 19), new Vector3(255, 0, 0));
    drawTriangle(canvas, new Vector2(10, 10), new Vector2(30, 19), new Vector2(5, 19), new Vector3(255, 0, 0));
}
function drawTriangle(canvas, v0, v1, v2, color) {
    let v = [v0, v1, v2].sort((a, b) => a.y - b.y);
    drawFlatBottomTriangle(canvas, v, color);
}
function drawFlatBottomTriangle(canvas, v, color) {
    const slope1 = (v[1].x - v[0].x) / (v[1].y - v[0].y);
    const slope2 = (v[2].x - v[0].x) / (v[2].y - v[0].y);
    if (v[1].y !== v[2].y)
        throw new Error('invariant violation');
    let x1 = v[0].x;
    let x2 = v[0].x;
    for (let y = v[0].y; y <= v[1].y; y += 1) {
        for (let x = x1; x <= x2; x++) {
            canvas.dot(x, y, rgbString(color));
        }
        x1 += slope1;
        x2 += slope2;
    }
}
function drawLine(canvas, v0, v1, color) {
    let steep = false;
    let x0 = v0.x;
    let x1 = v1.x;
    let y0 = v0.y;
    let y1 = v1.y;
    if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) {
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
function rgbString(color) {
    return `rgb(${color.x},${color.y},${color.z})`;
}
