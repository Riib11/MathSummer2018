(function(){

//
/////////////////////////////////////////
// Scene Setup
/////////////////////////////////////////
//

var container = document.getElementById("container")
var container_style = window.getComputedStyle(container)

var container_width = (
    container_style.getPropertyCSSValue
    ? parseInt(container_style.getPropertyCSSValue("width").cssText.replace("px",""))
    : parseInt(container_style.getPropertyValue("width").replace("px",""))
)

// canvas
var canvas = document.getElementById("canvas2")
canvas.width = container_width
canvas.height = container_width/1.7 // /1.5

// scene
var scene = new THREE.Scene()
scene.background = new THREE.Color( 0x000000 ) // black

// camera
var camera = new THREE.OrthographicCamera(
    -canvas.width/2, canvas.width/2,
    canvas.height/2, -canvas.height/2,
    1, 2000 )
camera.position.set( 0,0,500 )
camera.lookAt( scene.position )
scene.add( camera )

// renderer
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas
})
// renderer.setPixelRatio( getPixRatio() )
renderer.setSize( canvas.width, canvas.height )

// scale
const scale = 70

// colors
const color_volume     = 0x00ff00
const color_square     = 0x0000ff
const color_derivative = 0xff0000
const color_grid       = 0x000000

// square bounds
var square_bounds_r = [0,0.3]
var square_bounds_t = [0,0.3]

// volume bounds
const volume_bounds_r = [0,1]
const volume_bounds_t = [0,1]

// scales
const grain = 0.1
const size = 1
const graph_separation = 250
const axes_size = 1

//
/////////////////////////////////////////
// OBJECTS
/////////////////////////////////////////
//

//
// Globals
//
var pos = [0,0]

function makeShape(trans,f1,f2,tmin,tmax, step=0.01) {
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
    for (var t = tmin; t <= tmax; t += step) {
        shape.lineTo( ta(f1(t)+x,t+y), tb(f1(t)+x,t+y) )
    }
    // side
    for (var r = f1(tmax); r < f2(tmax); r += step) {
        shape.lineTo( ta(r+x,tmax+y), tb(r+x,tmax+y) )
    }
    // outer: f2
    for (var t = tmax; t >= tmin; t -= step) {
        shape.lineTo( ta(f2(t)+x,t+y), tb(f2(t)+x,t+y) )
    }
    // side
    for (var r = f2(tmin); r > f1(tmin); r -= step) {
        shape.lineTo( ta(r+x,tmin+y), tb(r+x,tmin+y) )
    }
    
    return shape
}

var grid_material = new THREE.LineBasicMaterial({ color:0x000000 })

grid_threshold = 100
function isInBounds(a,b) {
    return Math.sqrt( Math.pow(a,2) + Math.pow(b,2) ) <= grid_threshold
}

function makeLineR(trans, t, rmin, rmax, step=1) {
    let
        geo = new THREE.Geometry(),
        ta = function(a,b) { return trans(a,b)[0] },
        tb = function(a,b) { return trans(a,b)[1] }

    for (var r = rmin; r <= rmax; r += step) {
        let a = ta(r,t), b = tb(r,t)
        if (!isInBounds(a,b)) { break }
        geo.vertices.push(new THREE.Vector3(a, b, 1))
    }

    let line = new THREE.Line( geo, grid_material )
    return line
}

function makeLineT(trans, r, tmin, tmax, step=1) {
    let
        geo = new THREE.Geometry(),
        ta = function(a,b) { return trans(a,b)[0] },
        tb = function(a,b) { return trans(a,b)[1] }

    for (var t = tmin; t <= tmax; t += step) {
        let a = ta(r,t), b = tb(r,t)
        if (!isInBounds(a,b)) { break }
        geo.vertices.push(new THREE.Vector3(a, b, 1))
    }

    let line = new THREE.Line( geo, grid_material )
    return line
}

//
// Polar
//
var pol_graph = new THREE.Group()
pol_graph.position.set( -graph_separation,0,0 )
// pol_graph.scale.set( scale, scale, scale )
scene.add( pol_graph )

// shape
function makePolShape(f1,f2,tmin,tmax) {
    return makeShape( id2, f1, f2, tmin, tmax, 0.1 )
}

//
// square
//
var pol_square

function makePolSquareGeometry() {
    return new THREE.ShapeBufferGeometry(
        makePolShape(
            constant(square_bounds_r[0]),
            constant(square_bounds_r[1]*scale),
            square_bounds_t[0],
            square_bounds_t[1]*scale
    ))
}

function makePolSquare() {
    let mesh = new THREE.Mesh(
        makePolSquareGeometry(),
        new THREE.MeshBasicMaterial({
            color: color_square,
            needsUpdate: true
        })
    )
    return mesh
}

// update polar graph
function updatePol() {

    ////////////////////////////
    // update square

    if (pol_square) {
        pol_square.geometry = makePolSquareGeometry()
        pol_square.geometry.attributes.position.needsUpdate = true
    } else {
        pol_square = makePolSquare()
        pol_graph.add(pol_square)
    }
}

//
// derivative
//
var derivative

function getDerivative(u,v) {
    return [
        2*u , -2*v,
        2*v ,  2*u
    ]
}

function makeDerivativeShape(trans, f1, f2, tmin, tmax) {
    let
        shape = new THREE.Shape(),
        x = pos[0],
        y = pos[1],
        s = size,
        ta = function(a,b) { return trans(a,b)[0] },
        tb = function(a,b) { return trans(a,b)[1] }

    // position
    let
        // vertex 0
        x0 = f1(tmin)+x,
        y0 = tmin+y,
        // vertex 1
        x1 = f1(tmax)+x,
        y1 = tmax+y,
        // vertex 2
        x2 = f2(tmax)+x,
        y2 = tmax+y,
        // vertex 3
        x3 = f2(tmin)+x,
        y3 = tmin+y,
        // vectors spanning square
        // take the derivatives of the vectors
        // BEFORE doing the transformation!
        // so dont do the ta, tb, just do it
        // on the polar coordinates
        b1 = vec2_sub( [x1,y1], [x0,y0] ),
        b2 = vec2_sub( [x3,y3], [x0,y0] )

    // derivative
    let
        dT = getDerivative( x0, y0 ),
        db1 = lintrans2_apply( dT, b1 ),
        db2 = lintrans2_apply( dT, b2 ),
        db3 = vec2_add( db1, db2 )

    let 
        tx = ta(x0,y0),
        ty = tb(x0,y0)

    // define shape
    shape.moveTo( tx, ty )
    shape.lineTo( tx + db1[0], ty + db1[1])
    shape.lineTo( tx + db3[0], ty + db3[1])
    shape.lineTo( tx + db2[0], ty + db2[1])
    shape.lineTo( tx, ty )

    return shape
}

function makeDerivativeGeometry() {
    return new THREE.ShapeBufferGeometry(
        makeDerivativeShape(
            uv_to_cart,
            constant(square_bounds_r[0]),
            constant(square_bounds_r[1]),
            square_bounds_t[0],
            square_bounds_t[1]
    ))
}

function makeDerivative() {
    let mesh = new THREE.Mesh(
        makeDerivativeGeometry(),
        new THREE.MeshBasicMaterial({
            color: color_derivative,
            needsUpdate: true,
            transparent: true,
            opacity: 0.5
        })
    )
    mesh.position.setZ(2)
    return mesh
}

//
// volume
//
var pol_volume

function makePolVolume() {
    return new THREE.Mesh(
        new THREE.ShapeBufferGeometry(
                makePolShape(
                    constant(volume_bounds_r[0]),
                    constant(volume_bounds_r[1]*scale),
                    volume_bounds_t[0],
                    volume_bounds_t[1]*scale
                )
        ),
        new THREE.MeshBasicMaterial({
            color: color_volume,
            needsUpdate: true
        })
    )
}

pol_volume = makePolVolume()
pol_graph.add(pol_volume)

//
// Cartesian
//
var cart_graph = new THREE.Group()
cart_graph.position.set( graph_separation,0,0 )
cart_graph.scale.set( scale, scale, scale )
scene.add( cart_graph )

var cart_mesh

// shape
function makeCartShape(f1, f2, tmin, tmax) {
    return makeShape( uv_to_cart, f1, f2, tmin, tmax)
}

function makeCartSquareGeometry() {
    return new THREE.ShapeBufferGeometry(
        makeCartShape(
            constant(square_bounds_r[0]),
            constant(square_bounds_r[1]),
            square_bounds_t[0],
            square_bounds_t[1]
    ))
}

// square
function makeCartSquare() {
    let mesh = new THREE.Mesh(
        makeCartSquareGeometry(),
        new THREE.MeshBasicMaterial({
            color: color_square,
            needsUpdate: true
        }
    ))
    mesh.position.setZ(2)
    return mesh
}

// update
function updateCart() {

    ////////////////////////////
    // update cartesian
    if (cart_mesh) {
        cart_mesh.geometry = makeCartSquareGeometry()
        cart_mesh.geometry.attributes.position.needsUpdate = true
    } else {
        cart_mesh = makeCartSquare()
        cart_graph.add(cart_mesh)
    }

    ////////////////////////////
    // update derivative
    if (derivative) {
        derivative.geometry = makeDerivativeGeometry()
        derivative.geometry.attributes.position.needsUpdate = true
    } else {
        derivative = makeDerivative()
        cart_graph.add(derivative)
    }
}

//
// volume
//
var cart_volume

function makeCartVolume() {
    return new THREE.Mesh(
        new THREE.ShapeBufferGeometry(
                makeCartShape(
                    constant(volume_bounds_r[0]),
                    constant(volume_bounds_r[1]),
                    volume_bounds_t[0],
                    volume_bounds_t[1]
                )
        ),
        new THREE.MeshBasicMaterial({
            color: color_volume,
            needsUpdate: true
        })
    )
}

cart_volume = makeCartVolume()
cart_graph.add(cart_volume)

//
// Axes
//
var cart_axes, pol_axes
var axes_material = new THREE.LineBasicMaterial({ color: 0xffffff })

// Cartesian

function makeAxisLine(graph,x1,y1,z1,x2,y2,z2) {
    let geo = new THREE.Geometry()
    geo.vertices.push(new THREE.Vector3( x1, y1, z1 ))
    geo.vertices.push(new THREE.Vector3( x2, y2, z2 ))
    let line = new THREE.Line( geo, axes_material )
    line.scale.set( axes_size, axes_size, axes_size )
    scene.add( line )
    graph.add( line )
    return line
}

var cart_axis_x = makeAxisLine(cart_graph, -3, 0, 0, /**/ 3, 0, 0 ) // x
var cart_axis_y = makeAxisLine(cart_graph,  0,-3, 0, /**/ 0, 3, 0 ) // y


// Polar
function makeAxisCircle(graph, r) {
    var resolution = 100
    var amplitude = r
    var size = 360 / resolution

    var geometry = new THREE.Geometry()
    for(var i = 0; i <= resolution; i++) {
        var segment = ( i * size ) * Math.PI / 180
        geometry.vertices.push(
            new THREE.Vector3(
                Math.cos( segment ) * amplitude,
                Math.sin( segment ) * amplitude,
                0 ))
    }

    var line = new THREE.Line( geometry, axes_material )
    line.scale.set( axes_size, axes_size, axes_size )
    scene.add(line)
    graph.add(line)
    return line
}

// var pol_axis_r1  = makeAxisCircle(pol_graph, 1 )
// var pol_axis_r2  = makeAxisCircle(pol_graph, 2 )
// var pol_axis_r3  = makeAxisCircle(pol_graph, 3 )
var pol_axis_t0  = makeAxisLine(pol_graph, -3*scale, 0, 0, /**/ 3*scale, 0, 0 )
var pol_axis_tp2 = makeAxisLine(pol_graph,  0,-3*scale, 0, /**/ 0, 3*scale, 0 )

//
// Grid
//

// parameters
var grid_sep = 0.2

// polar grid
var pol_grid

function makePolGrid() {
    let grid = new THREE.Group()

    for (var i = volume_bounds_r[0]+grid_sep; i < volume_bounds_r[1]; i+= grid_sep) {
        grid.add(makeLineT( id2, i, volume_bounds_t[0], volume_bounds_t[1] ))
    }

    for (var i = volume_bounds_t[0]+grid_sep; i < volume_bounds_t[1]; i+= grid_sep) {
        grid.add(makeLineR( id2, i, volume_bounds_r[0], volume_bounds_r[1] ))
    }

    grid.scale.set( scale, scale, scale )

    return grid
}
pol_grid = makePolGrid()
pol_graph.add(pol_grid)

// cart grid
var cart_grid
grid_sep = 0.15

function makeCartGrid() {
    let grid = new THREE.Group()

    for (var i = volume_bounds_r[0]+grid_sep; i < volume_bounds_r[1]+grid_sep; i+= grid_sep) {
        grid.add(makeLineT( uv_to_cart, i, volume_bounds_t[0], volume_bounds_t[1], 0.1))
    }

    for (var i = volume_bounds_t[0]+grid_sep; i < volume_bounds_t[1]+grid_sep; i+= grid_sep) {
        let line = makeLineR( uv_to_cart, i, volume_bounds_r[0], volume_bounds_r[1], 0.1 )
        console.log(line.geometry.vertices)
        grid.add(line)
    }

    // grid.scale.set( 1/scale, 1/scale, 1/scale )
    return grid
}
cart_grid = makeCartGrid()
cart_graph.add(cart_grid)

// var geo = new THREE.Geometry()
// geo.vertices.push(new THREE.Vector3(0,0,0), new THREE.Vector3(-200,200,10))
// cart_graph.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color:0x000000 })))


//
/////////////////////////////////////////
// INITIALIZE
/////////////////////////////////////////
//

updateCart()
updatePol()

//
/////////////////////////////////////////
// DRAG CONTROLS
/////////////////////////////////////////
//

// translation

const color_passive = 0x0000ff
const color_active  = 0x000099

var dragControls = new THREE.DragControls([pol_square], camera, renderer.domElement);
dragControls.addEventListener('dragstart', function(event) {
    event.object.material.color.set( color_active )
});
dragControls.addEventListener('dragend', function(event) {
    event.object.material.color.set( color_passive )
});

dragControls.drag_xmin = -70, dragControls.drag_xmax = 70;
dragControls.drag_ymin = -70, dragControls.drag_ymax = 70;

// function updatePos() {
//     if (dragControls.drag_position == undefined) { return }
//     let new_x = (
//         dragControls.drag_position.x
//         / (dragControls.drag_xmax - dragControls.drag_xmin)
//         * (volume_bounds_r[1] + (2*square_bounds_r[1])))
//     let new_y = (
//         dragControls.drag_position.y
//         / (dragControls.drag_ymax - dragControls.drag_ymin)
//         * (volume_bounds_t[1] + (2*square_bounds_t[1])))
//     pos = [new_x, new_y]
//     updatePol()
//     updateCart()
//     updateScaleControlsScale()
// }

function updatePos() {
    let new_x = (2*
        dragControls.drag_position.x
        / (dragControls.drag_xmax - dragControls.drag_xmin)
        * (volume_bounds_r[1] - volume_bounds_r[0]
            - 0 /*(square_bounds_r[1] - square_bounds_r[0])*/))
    let new_y = (2*
        dragControls.drag_position.y
        / (dragControls.drag_ymax - dragControls.drag_ymin)
        * (volume_bounds_t[1] - volume_bounds_t[0]
            - 0 /*(square_bounds_t[1] - square_bounds_t[0])*/))
    pos = [new_x, new_y]
    updatePol()
    updateCart()
    updateScaleControlsScale()
}

// scaling

const color_scale = 0xff0000

var scaleCornerGroup = new THREE.Group()
pol_square.add(scaleCornerGroup)

var corner_size = 15
var scaleCorner = new THREE.Mesh(
    // new THREE.BoxGeometry( corner_size,corner_size,corner_size ),
    new THREE.CircleGeometry( corner_size/2, 20 ),
    new THREE.MeshBasicMaterial({
        color: color_scale,
        transparent: true,
        opacity: 0.5
}))
scaleCorner.position.set(
    square_bounds_r[1]*scale+corner_size/2,
    square_bounds_t[1]*scale+corner_size/2,
    2)
scaleCornerGroup.add(scaleCorner)

var scaleControls = new THREE.DragControls([scaleCorner], camera, renderer.domElement);
scaleControls.addEventListener('dragstart', function(event) {
    event.object.material.opacity = 1
});
scaleControls.addEventListener('drag', function(event) {
    updateScale()
    updatePol()
    updatePos()
});

scaleControls.addEventListener('mouseenter', function(event) {
    console.log("hello")
})

scaleControls.addEventListener('dragend', function(event) {
    event.object.material.opacity = 0.5
});

// x
scaleControls.drag_xmin = corner_size/2
scaleControls.drag_xmax = 1 * scale
// y
scaleControls.drag_ymin = corner_size/2
scaleControls.drag_ymax = 1 * scale

function updateScale() {
    var scale_x = (scaleCorner.position.x - corner_size/2) / scale
    var scale_y = (scaleCorner.position.y - corner_size/2) / scale

    square_bounds_r = [0,scale_x]
    square_bounds_t = [0,scale_y]
}

function updateScaleControlsScale() {
    // TODO: hmmm
}

// const square_bounds_r = [0,0.4]
// const square_bounds_t = [0,Math.PI/8]

//
/////////////////////////////////////////
// UPDATES
/////////////////////////////////////////
//

function render() {
    renderer.render(scene, camera)
}

function update(time) {
    updatePos()
    render()
    requestAnimationFrame(update)
}
requestAnimationFrame(update)

})()