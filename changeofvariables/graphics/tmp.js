function makeShape(trans,f1,f2,tmin,tmax) {
    let
        shape = new THREE.Shape(),
        x = pos[0],
        y = pos[1],
        s = size,
        ta = function(a,b) { return trans(a,b)[0] },
        tb = function(a,b) { return trans(a,b)[1] }

    // start
    shape.moveTo( ta(f1(tmin)+x,tmin+y), tb(f1(tmin)+x,tmin+y) )

    // inner : f1
    for (var t = tmin; t <= tmax; t += Math.PI*0.01) {
        shape.lineTo( ta(f1(t)+x,t+y), tb(f1(t)+x,t+y) )
    }
    // outer: f2
    for (var t = tmax; t >= tmin; t -= Math.PI*0.01) {
        shape.lineTo( ta(f2(t)+x,t+y), tb(f2(t)+x,t+y) )
    }
    
    return shape
}


// example ussage
makeCartShape(
    constant(square_bounds_r[0]),
    constant(square_bounds_r[1]),
    square_bounds_t[0],
    square_bounds_t[1]
)

makePolShape(
    constant(square_bounds_r[0]),
    constant(square_bounds_r[1]),
    square_bounds_t[0],
    square_bounds_t[1]
)