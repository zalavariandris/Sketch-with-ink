import bSpline from "https://cdn.skypack.dev/b-spline@2.0.2";

/*
UTILS
*/
// Return evenly spaced numbers over a specified interval. Including start and stop.
function linspace(start, stop, num) {
    if (num <= 2) {
        return [start, stop];
    }
    let numbers = [];
    const step = (stop - start) / (num - 1);
    for (let v = start; v < stop; v += step) {
        numbers.push(v);
    }
    numbers.push(stop)
    return numbers;
}

function _in_range(min, max) {
    return Math.random() * (max - min) + min;
}

/*
STROKE
*/
export class Vertex {
    /*stroke vertices*/
    constructor(x, y, t, l = 0.0) {
        this.x = x; // vertex x position
        this.y = y; // y position
        this.t = t; // time vertex created for animation and speed
        this.l = l; // stroke length at this point from first vertex. set stroke length at vertex creation for speedy acces to stroke length.
    }
}

export class Stroke {
    constructor(vertices) {
        this.vertices = vertices;
        this.calc_length();
    }

    calc_length() {
        /*calculate and store each vertex length from scratch*/
        if (this.vertices.length < 1) {
            return;
        }

        this.vertices[0].l = 0;
        for (let i = 1; i < this.vertices.length; i++) {
            const V0 = this.vertices[i - 1];
            const V1 = this.vertices[i];

            const l = Math.sqrt((V0.x - V1.x) ** 2 + (V0.y - V1.y) ** 2)
            V1.l = V0.l + l;
        }
        return this.vertices[this.vertices.length - 1].l;
    }

    length(start = 0.0, stop = 1.0) {
        /*return length of stroke from start to stop*/
        const vertices_count = this.vertices.length;
        const start_idx = Math.floor((vertices_count - 1) * start);
        const end_idx = Math.floor((vertices_count - 1) * stop);
        const V1 = this.vertices[end_idx];
        const V0 = this.vertices[start_idx];
        return V1.l - V0.l;
    }

    interpolated(n = 10, start = 0.0, stop = 1.0) {
        /* Return a new interpolated stroke*/

        // create the bezier spline
        let degree = 2;

        // create a clamped knot array. So the spline pass through the two endpoints!
        var knots = [];
        for (let i = 0; i < degree; i++) { knots.push(0); }
        for (let i = 0; i < this.vertices.length - 1; i++) { knots.push(i); }
        for (let i = 0; i < degree; i++) { knots.push(this.vertices.length - 2); }

        // sample b-spline
        let vertices = [];
        for (let t of linspace(start, stop, n)) {
            var [x, y] = bSpline(t, degree, this.vertices.map((V) => [V.x, V.y]), knots);
            var time = bSpline(t, degree, this.vertices.map((V) => [V.t]), knots);
            vertices.push(new Vertex(x, y, time));
        }

        return new Stroke(vertices);
    }

    add(x, y, t) {
        // Add new vertex to stroke
        let vertex = new Vertex(
            x,
            y,
            t,
            0.0
        );

        // precalculate new segment lengths
        if (this.vertices.length == 0) {
            vertex.l = 0.0;
        }
        else {
            const last_vertex = this.vertices[this.vertices.length - 1];
            const distance_from_last_vertex = Math.sqrt((vertex.x - last_vertex.x) ** 2 + (vertex.y - last_vertex.y) ** 2);
            vertex.l = last_vertex.l + distance_from_last_vertex;
        }
        this.vertices.push(vertex);
    }
}