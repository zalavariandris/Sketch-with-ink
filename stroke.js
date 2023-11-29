/*
STROKE
*/
export class Vertex
{
  /*stroke vertices*/
  constructor(x,y,t,d=0)
  {
    this.x = x; // vertex x position
    this.y = y; // y position
    this.t=t; // time vertex created for animation and speed
    this.l=undefined; // stroke length at this point from first vertex. set stroke length at vertex creation for speedy acces to stroke length.
  }
}

export class Stroke {
  constructor(vertices){
    this.vertices = vertices;
  }
  
  calc_length(){
      /*not used yer*/
    let total_length=0;
    for(let i=1; i<this.vertices.length; i++){
      const V0 = stroke[i-1];
      const V1 = stroke[i];

      const l = Math.sqrt((P0.x-P1.x)**2 + (P0.y-P1.y)**2)
      total_length+=l;
      V1.l=total_length;
    }
    return total_length;
  }
  
  interpolated(n=10, start=0.0, stop=1.0)
  {
    /* Return a new interpolated stroke*/
    
    // create the bezier spline
    let degree = 2;
    
    // create a clamped knot array. So the spline pass through the two endpoints!
    var knots = [];
    for(let i=0; i<degree;i++){knots.push(0);}
    for(let i=0; i<this.vertices.length-1; i++){knots.push(i);}
    for(let i=0; i<degree;i++){knots.push(this.vertices.length-2);}

    // sample b-spline
    let vertices = [];
    for(let t of linspace(start,stop,10)) {
      var [x,y] = bSpline(t, degree, this.vertices.map((V)=>[V.x, V.y]), knots);
      var time = bSpline(t, degree, this.vertices.map((V)=>[V.t]), knots);
      vertices.push(new Vertex(x, y, time));
    }
    
    return new Stroke(vertices);
  }
  
  add(x, y, t){
        // Add new vertex to stroke
    let vertex = new Vertex(
      x, 
      y, 
      t,
      undefined
    );
    
    // precalculate segment lengths
    if(this.vertices.length>1){
      const P0 = this.vertices[this.vertices.length-1];
      vertex.l=Math.sqrt((vertex.x-P0.x)**2 + (vertex.y-P0.y)**2);
      if(P0.l!=undefined){
        vertex.l+=P0.l;
      }
    }
    
    this.vertices.push(vertex);
  }
}