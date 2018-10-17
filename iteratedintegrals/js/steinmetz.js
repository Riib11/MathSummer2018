(function() {

/////////////////////////////////////////
// Scene Setup
/////////////////////////////////////////

var container = document.getElementById("container")
var container_style = window.getComputedStyle(container)

var container_width = (
    container_style.getPropertyCSSValue
    ? parseInt(container_style.getPropertyCSSValue("width").cssText.replace("px",""))
    : parseInt(container_style.getPropertyValue("width").replace("px",""))
)

// canvas
var canvas = document.getElementById("canvas3")
canvas.width = container_width;
canvas.height = container_width/1.5;

// scene
var scene = new THREE.Scene()
scene.background = new THREE.Color( 0x000000 )

// camera
var camera = new THREE.PerspectiveCamera( 50, canvas.width / canvas.height, 1, 5000 )
camera.position.set( 400,400,400 )
camera.lookAt( scene.position )
scene.add( camera )

// axes
var axesHelper = new THREE.AxesHelper( 200 );
axesHelper.material.depthTest = false
axesHelper.renderOrder = 10
axesHelper.position.set( -300, -50, -300 )
scene.add( axesHelper );

// renderer
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( canvas.width, canvas.height )

/////////////////////////////////////////
// Trackball Controller
/////////////////////////////////////////

var controls = new THREE.TrackballControls( camera, renderer.domElement )
controls.rotateSpeed = 10.0
controls.zoomSpeed = 0;//3.2
controls.panSpeed = 0.8
controls.noZoom = false
controls.noPan = true
controls.staticMoving = false
controls.dynamicDampingFactor = 0.2

// labels
var loader = new THREE.FontLoader();
var texts = []
loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
    let font_style = {
        font: font,
        size: 40,
        height: 5,
        curveSegments: 12,
        bevelEnabled: false
    }

    function makeLabel(label, pos, color) {
        let text_geo = new THREE.TextGeometry(label, font_style)
        let text_mat = new THREE.MeshBasicMaterial(
            { color: new THREE.Color(color[0],color[1],color[2]) })
        let text = new THREE.Mesh(text_geo, text_mat)
        text.position.set(pos[0],pos[1],pos[2])
        text.rotation = camera.rotation
        scene.add(text)
        texts.push(text)
    }
    // 
    makeLabel( "x", [-300+200, 10, -300], [1,0,0] )
    makeLabel( "y", [-300, 10, -300+200], [0,0,1] )
    makeLabel( "z", [-300, 10+200, -300], [0,1,0] )
});

controls.addEventListener("change", function() {
    for (var i in texts) {
        texts[i].lookAt(camera.position)
    }
})


/////////////////////////////////////////
// Utility Functions
/////////////////////////////////////////

var format3dec = function (x) {
    if (x) {
        let s = (Math.floor(x*100)/100).toString()
        if (x < 0) {
            if      (s.length == 4) { s += "0" }
            else if (s.length == 2) { s += ".00" }
            return s
        } else {
            if      (s.length == 3) { s += "0" }
            else if (s.length == 1) { s += ".00" }
            return "+" + s
        }
    }
    return "+0.00"
}

/////////////////////////////////////////
// OBJECTS
/////////////////////////////////////////

// axes
var axesHelper = new THREE.AxesHelper( 500 );
axesHelper.material.depthTest = false
axesHelper.renderOrder = 10
// scene.add( axesHelper );

function updateAxes(evt) {
    const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
    axesHelper.visible = target2_.checked
    render()
}
// var control_axes = document.getElementById("control_axes")
// control_axes.addEventListener("change", updateAxes)
// updateAxes({ target2_:control_axes })

// slices

const scale = 150

var y = function(x,z) {
    return Math.sqrt(1 - Math.pow(z,2))
}

var line_material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    linewidth: 3,
    depthTest: false,
    linecap: "round"
})

// var slice_material = new THREE.MeshBasicMaterial({
//     color: 0x0000ff,
//     side: THREE.DoubleSide,
//     needsUpdate: true,
//     depthTest: false
// })

var slice_material_solid = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,
    needsUpdate: true,
    depthTest: false,
    shininess: 10,
    specular: 0x222222,
})

var slice_material_transparent = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,
    needsUpdate: true,
    depthTest: true,
    shininess: 10,
    specular: 0x222222,
})

var slice_material = slice_material_solid

var slices = []

function updateSliceMaterial() {
    for (var i = 0; i < slices.length; i++) {
        slices[i].material = slice_material
    }
}

/////////////////////////////////////////
// Integration 1 : x then y
/////////////////////////////////////////

_ = function() {

    const zrange = 1
    var slider_x, slider_z

    var y_slicez = function(x) { return y(x,slider_z) }
    var y_slicex = function() { return y(slider_x,slider_z) }

    /////////////////////////////////////////
    // SLICE Z
    /////////////////////////////////////////

    function getUpdatedSliceZShape() {
        var shape = new THREE.Shape()
        const radius = y_slicez(0)
        shape.moveTo(-radius,0)
        // top
        for (var x = -radius; x <= radius; x += 0.01) {
            shape.lineTo(x,y_slicez(x))
        }
        // bottom
        for (var x = radius; x >= -radius; x -= 0.01) {
            shape.lineTo(x,-y_slicez(x))
        }
        return shape
    }

    var slicez
    slices.pop(slicez)

    function make_slicez() {
        slicez = new THREE.Mesh(
            new THREE.ShapeBufferGeometry( getUpdatedSliceZShape() ),
            slice_material)
        slicez.rotation.set(0,0,0)
        slicez.scale.set(scale,scale,scale)
        slicez.position.set(0,0,slider_z*scale)
        slicez.renderOrder = 1
    }


    /////////////////////////////////////////
    // SLICE X
    /////////////////////////////////////////

    function getUpdatedSliceXGeometry() {
        var geo = new THREE.Geometry()
        geo.vertices.push(new THREE.Vector3( 0,-y_slicex(),0 ))
        geo.vertices.push(new THREE.Vector3( 0,y_slicex(),0 ))
        return geo
    }

    var slicex
    slices.pop(slicex)

    function make_slicex() {
        slicex = new THREE.Line(
            getUpdatedSliceXGeometry(),
            line_material)
        slicex.scale.set(scale,scale,scale)
        slicex.position.set(slider_x*scale,0,slider_z*scale)
        slicex.renderOrder = 2
    }

    /////////////////////////////////////////
    // UPDATE SLICES
    /////////////////////////////////////////

    function updateSlices() {
        // slice Z
        scene.remove(slicez)
        make_slicez()
        scene.add(slicez)

        // slice X
        scene.remove(slicex)
        make_slicex()
        scene.add(slicex)

    }
    updateSlices()

    /////////////////////////////////////////
    // Animation Contols
    /////////////////////////////////////////

    //
    // display text
    //
    const target2_1_x = document.getElementById("target2_1_1_x")
    const target2_1_z = document.getElementById("target2_1_1_z")

    function updatetarget2_1(x,z) {
        katex.render(" x = " + format3dec(x), target2_1_x)
        katex.render(" y = " + format3dec(z), target2_1_z)
    }

    //
    // control sliders
    //
    const control_x = document.getElementById("control1_1_x")
    function updateControlX(evt) {
        const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
        const value = target2_.value
        const radius = y_slicez(0)
        slider_x = value * radius
        updateSlices()
        render()
        updatetarget2_1(slider_x, slider_z)
    }
    control_x.addEventListener("input", updateControlX)
    updateControlX({ target2_:control_x })

    const control_z = document.getElementById("control1_1_z")
    function updateControlZ(evt) {
        var target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
        var value = target2_.value
        slider_z = value * zrange
        updateSlices()
        render()
        updatetarget2_1(slider_x, slider_z)
    }
    control_z.addEventListener("input", updateControlZ)
    updateControlZ({ target2_:control_z })

}()

/////////////////////////////////////////
// Integration 1 : Z then X
/////////////////////////////////////////

_ = function() {

    const xrange = 1
    var slider_x, slider_z

    var y_slicex = function(z) { return y(slider_x,z) }
    var y_slicez = function()  { return y(slider_x,slider_z) }

    /////////////////////////////////////////
    // SLICE X
    /////////////////////////////////////////

    function getUpdatedSliceXShape() {
        var shape = new THREE.Shape()
        // const radius = y_slicex(0)*2
        const radius = Math.sqrt(1 - Math.pow(slider_x,2))
        shape.moveTo(-radius,0)
        // top
        for (var z = -radius; z <= radius; z += 0.01) {
            shape.lineTo( z , y_slicex(z) )
        }
        // bottom
        for (var z = radius; z >= -radius; z -= 0.01) {
            shape.lineTo( z , -y_slicex(z) )
        }
        return shape
    }

    var slicex
    slices.pop(slicex)

    function make_slicex() {
        slicex = new THREE.Mesh(
            new THREE.ShapeBufferGeometry( getUpdatedSliceXShape() ),
            slice_material)
        slicex.rotation.set(0,Math.PI/2,0)
        slicex.scale.set(scale,scale,scale)
        slicex.position.set(slider_x*scale,0,0)
        slicex.renderOrder = 3
    }

    /////////////////////////////////////////
    // SLICE Z
    /////////////////////////////////////////

    function getUpdatedSliceZGeometry() {
        var geo = new THREE.Geometry()
        geo.vertices.push(new THREE.Vector3( 0,-y_slicez(), 0 ))
        geo.vertices.push(new THREE.Vector3( 0, y_slicez(), 0 ))
        return geo
    }

    var slicez
    slices.pop(slicez)

    function make_slicez() {
        slicez = new THREE.Line(
            getUpdatedSliceZGeometry(),
            line_material)
        slicez.scale.set(scale,scale,scale)
        slicez.position.set(slider_x*scale,0,slider_z*scale)
        slicez.renderOrder = 4
    }

    /////////////////////////////////////////
    // UPDATE SLICES
    /////////////////////////////////////////

    function updateSlices() {
        // slice X
        scene.remove(slicex)
        make_slicex()
        scene.add(slicex)
        // slice Z
        scene.remove(slicez)
        make_slicez()
        scene.add(slicez)
    }
    updateSlices()

    /////////////////////////////////////////
    // Animation Contols
    /////////////////////////////////////////

    //
    // display text
    //
    const target2_2_x = document.getElementById("target2_1_2_x")
    const target2_2_z = document.getElementById("target2_1_2_z")

    function updatetarget2_2(x,z) {
        katex.render(" x = " + format3dec(x), target2_2_x)
        katex.render(" y = " + format3dec(z), target2_2_z)
    }

    //
    // control
    //
    const control_x = document.getElementById("control1_2_x")
    function updateControlX(evt) {
        const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
        const value = target2_.value
        slider_x = xrange * value
        updateSlices()
        render()
        updatetarget2_2(slider_x, slider_z)
    }
    control_x.addEventListener("input", updateControlX)
    updateControlX({ target2_:control_x })

    const control_z = document.getElementById("control1_2_z")
    function updateControlY(evt) {
        var target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
        var value = target2_.value
        const radius = Math.sqrt(1 - Math.pow(slider_x,2))
        slider_z = radius * value
        updateSlices()
        render()
        updatetarget2_2(slider_x, slider_z)
    }
    control_z.addEventListener("input", updateControlY)
    updateControlX({ target2_:control_z })

}()

/////////////////////////////////////////
// VOLUME
/////////////////////////////////////////

var volume
var material = new THREE.MeshPhongMaterial({
    color: 0x996633, 
    specular: 0x222222,
    shininess: 200,
    needsUpdate: true,
    depthTest: true,
    transparent: true,
    opacity: 0.5,
})

var stlloader = new THREE.STLLoader()
stlloader.load( 'models/steinmetz.stl', function ( geometry ) {
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    volume = new THREE.Mesh( geometry, material )
    volume.rotation.set( - Math.PI / 2, 0, 0 )  
    volume.scale.set( scale,scale,scale )
    volume.renderOrder = 0
    scene.add( volume )
})

/////////////////////////////////////////
// Animation Contols
/////////////////////////////////////////

// const control_opacity = document.getElementById("control_opacity")
// const opacity_display = document.getElementById("opacity_display")

// control_opacity.addEventListener("input", function() {
//     volume.material.opacity = control_opacity.value
//     opacity_display.innerText = control_opacity.value
// })


/////////////////////////////////////////
// PLANE
/////////////////////////////////////////

var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 400, 400 ),
    new THREE.MeshPhongMaterial({
        color: 0x999999, specular: 0x101010, side: THREE.DoubleSide
    })
)
plane.rotation.x = -Math.PI/2
plane.position.y = 0
plane.renderOrder = 0
// scene.add( plane )

function updatePlane(evt) {
    const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
    plane.visible = target2_.checked
    render()
}
// var control_plane = document.getElementById("control_plane")
// control_plane.addEventListener("change", updatePlane)
// updatePlane({ target2_:control_plane })

/////////////////////////////////////////
// Lighting
/////////////////////////////////////////

// ambient light
scene.add(new THREE.AmbientLight( 0xffffff , 1 ))

// directional light
scene.add(new THREE.DirectionalLight( 0xffffff ))

// point lights
function makePointLight(x,y,z) {
    var light = new THREE.PointLight( 0xaaaaaa, 4, 1000 )
    light.position.set( x,y,z )
    scene.add( light )
}
const light_dist = 200
makePointLight( -light_dist, light_dist, light_dist )
makePointLight(  light_dist,-light_dist,-light_dist )


/////////////////////////////////////////
// RENDER LOOP
/////////////////////////////////////////

function render() {
    renderer.render(scene, camera)
}

function update(time) {
    render()
    controls.update()
    requestAnimationFrame(update)
}

controls.addEventListener( 'change', render )
requestAnimationFrame(update)

/////////////////////////////////////////
// Window Resizing
/////////////////////////////////////////

// window.addEventListener( 'resize', function () {
//     camera.aspect = window.innerWidth / window.innerHeight
//     camera.updateProjectionMatrix()
//     renderer.setSize( window.innerWidth, window.innerHeight )
//     controls.handleResize()
//     render()
// }, false )

})()