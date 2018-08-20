var controls

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
var canvas = document.getElementById("canvas1")
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
axesHelper.position.set( -300, 0, -300 )
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

controls = new THREE.TrackballControls( camera, renderer.domElement )
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

// slices

const scale = 150
const coo_x = 1
const coo_z = 1

var y = function(x,z) {
    var term_x = coo_x * Math.pow(x,2)
    var term_z = coo_z * Math.pow(z,2)
    return Math.sqrt(term_x + term_z)
}

var line_material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    linewidth: 3,
    depthTest: true,
    linecap: "true"
})

// var slice_material = new THREE.MeshBasicMaterial({
//     color: 0x0000ff,
//     side: THREE.DoubleSide,
//     needsUpdate: true,
//     depthTest: false
// })

var slice_material

var slice_material_solid = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,
    needsUpdate: true,
    depthTest: true,
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

slice_material = slice_material_solid

var slices = []

function updateSliceMaterial() {
    for (var i = 0; i < slices.length; i++) {
        slices[i].material = slice_material
    }
}

/////////////////////////////////////////
// Intersection planes
/////////////////////////////////////////

// material
const plane_material = new THREE.MeshPhongMaterial({
    color: 0x000055,
    side: THREE.DoubleSide,
    needsUpdate: true,
    depthTest: true,
    shininess: 10,
    specular: 0x222222,
    transparent: true,
    opacity: 0.6
})

// bounds
const bs = [1000,1000]

var shape_plane1 = new THREE.Shape()
shape_plane1.moveTo(  bs[0],  bs[1] )
shape_plane1.lineTo( -bs[0],  bs[1] )
shape_plane1.lineTo( -bs[0], -bs[1] )
shape_plane1.lineTo(  bs[0], -bs[1] )
shape_plane1.lineTo(  bs[0],  bs[1] )

var plane1 = new THREE.Mesh(
    new THREE.ShapeBufferGeometry( shape_plane1 ),
    plane_material)
plane1.rotation.set(0,0,0)
plane1.scale.set(scale,scale,scale)
plane1.position.set(0,0,0)

scene.add(plane1)

const toggle_intersectionplane = document.getElementById("toggle_intersectionplane")
function updateToggleInsersectionPlane() {
    if (toggle_intersectionplane.checked) {
        plane1.material.visible = true
    } else {
        plane1.material.visible = false
    }
}

toggle_intersectionplane.addEventListener("change", updateToggleInsersectionPlane)
toggle_intersectionplane.checked = false
updateToggleInsersectionPlane()

/////////////////////////////////////////
// Integration 1 : x then y
/////////////////////////////////////////

_ = function() {

    const zrange = 1
    var slider_x, slider_z

    var y_slicez = function(x) { return y(x,slider_z) }
    var y_slicex = function()  { return y(slider_x,slider_z) }

    var get_rangex = function() { return Math.sqrt( 1 - Math.pow(slider_z,2) ) }
    var get_rangez = function() { return 1 }

    /////////////////////////////////////////
    // SLICE Z
    /////////////////////////////////////////

    function getUpdatedSliceZShape() {
        var shape = new THREE.Shape()
        const radius = get_rangex()
        shape.moveTo( -radius,1 )
        // top
        for (var x = -radius; x <= radius; x += 0.01) {
            shape.lineTo( x,1 )
        }
        // bottom
        for (var x = radius; x >= -radius; x -= 0.01) {
            shape.lineTo( x,y_slicez(x) )
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

        plane1.position.set(0,0,slider_z*scale)
    }

    /////////////////////////////////////////
    // SLICE X
    /////////////////////////////////////////

    function getUpdatedSliceXGeometry() {
        var geo = new THREE.Geometry()
        geo.vertices.push(new THREE.Vector3( 0,1,0 ))
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

    const control_x = document.getElementById("control1_x")
    function updateControlX(evt) {
        const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
        const value = target2_.value
        slider_x = value * get_rangex()
        updateSlices()
        render()
    }
    control_x.addEventListener("input", updateControlX)
    updateControlX({ target2_:control_x })

    const control_z = document.getElementById("control1_z")
    function updateControlZ(evt) {
        var target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
        var value = target2_.value
        slider_z = value * get_rangez()
        updateSlices()
        render()
    }
    control_z.addEventListener("input", updateControlZ)
    updateControlZ({ target2_:control_z })

}()

/////////////////////////////////////////
// Integration 1 : Y then X
/////////////////////////////////////////

_ = function() {

    const yrange = 1
    var slider_x, slider_y

    var z = function(x,y) { return Math.sqrt(Math.pow(y,2) - Math.pow(x,2)) }

    var z_slicey = function(x) { return z(x, slider_y) }
    var z_slicex = function()  { return z(slider_x, slider_y) }

    var get_rangex = function() { return slider_y }
    var get_rangey = function() { return 1 }

    /////////////////////////////////////////
    // SLICE Y
    /////////////////////////////////////////

    function getUpdatedSliceYShape() {
        var shape = new THREE.Shape()
        const radius = get_rangex()
        shape.moveTo( -radius,0 )
        // top
        for (var x = -radius; x <= radius; x += 0.01) {
            shape.lineTo( x, z_slicey(x) )
        }
        // bottom
        for (var x = radius; x >= -radius; x -= 0.01) {
            shape.lineTo( x,-z_slicey(x) )
        }
        return shape
    }

    var slicey
    slices.pop(slicey)

    function make_slicey() {
        slicey = new THREE.Mesh(
            new THREE.ShapeBufferGeometry( getUpdatedSliceYShape() ),
            slice_material)
        slicey.rotation.set(Math.PI/2,0,0)
        slicey.scale.set(scale,scale,scale)
        slicey.position.set(0,slider_y*scale,0)
        slicey.renderOrder = 1
    }

    /////////////////////////////////////////
    // SLICE X
    /////////////////////////////////////////

    function getUpdatedSliceXGeometry() {
        var geo = new THREE.Geometry()
        geo.vertices.push(new THREE.Vector3( 0, 0,-z_slicex() ))
        geo.vertices.push(new THREE.Vector3( 0, 0, z_slicex() ))
        return geo
    }

    var slicex
    slices.pop(slicex)

    function make_slicex() {
        slicex = new THREE.Line(
            getUpdatedSliceXGeometry(),
            line_material)
        slicex.scale.set(scale,scale,scale)
        slicex.position.set(slider_x*scale,slider_y*scale,0)
        slicex.renderOrder = 2
    }

    /////////////////////////////////////////
    // UPDATE SLICES
    /////////////////////////////////////////

    function updateSlices() {
        // slice Y
        scene.remove(slicey)
        make_slicey()
        scene.add(slicey)

        // slice X
        scene.remove(slicex)
        make_slicex()
        scene.add(slicex)

    }
    updateSlices()

    /////////////////////////////////////////
    // Animation Contols
    /////////////////////////////////////////

    const control_y = document.getElementById("control2_y")
    function updateControlY(evt) {
        const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
        const value = target2_.value
        slider_y = value * get_rangey()
        updateSlices()
        render()
    }
    control_y.addEventListener("input", updateControlY)
    updateControlY({ target2_:control_y })

    const control_x = document.getElementById("control2_x")
    function updateControlX(evt) {
        var target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
        var value = target2_.value
        slider_x = value * get_rangex()
        updateSlices()
        render()
    }
    control_x.addEventListener("input", updateControlX)
    updateControlX({ target2_:control_x })

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
    opacity: 0.38,
})

var stlloader = new THREE.STLLoader()
stlloader.load( 'models/cone.stl', function ( geometry ) {
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    volume = new THREE.Mesh( geometry, material )
    volume.rotation.set( - Math.PI / 2, 0, 0 )  
    volume.scale.set( scale,scale,scale )
    volume.renderOrder = 0

    // shadow
    volume.castShadow = true

    scene.add( volume )
})

/////////////////////////////////////////
// Animation Contols
/////////////////////////////////////////

const control_opacity = document.getElementById("control_opacity")
const opacity_display = document.getElementById("opacity_display")

function updateOpacity() {
    if (volume) { volume.material.opacity = control_opacity.value }
    opacity_display.innerText = control_opacity.value
}
control_opacity.addEventListener("input", updateOpacity)
updateOpacity()


/////////////////////////////////////////
// PLANE
/////////////////////////////////////////

const plane_size = 600

var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( plane_size, plane_size ),
    new THREE.MeshPhongMaterial({
        color: 0x222222,
        specular: 0x101010,
        side: THREE.DoubleSide
    })
)
plane.rotation.x = -Math.PI/2
plane.position.y = -50
plane.renderOrder = 0

// shadow
plane.receiveShadow = true

// scene.add( plane )

// function updatePlane(evt) {
//     const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
//     plane.visible = target2_.checked
//     render()
// }
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

// // point lights
// function makePointLight(x,y,z) {
//     var light = new THREE.PointLight( 0xaaaaaa, 3, 5000 )
//     light.position.set( x,y,z )

//     // shadow
//     light.castShadow = true
//     let helper = new THREE.CameraHelper( light.shadow.camera );
//     scene.add( helper );

//     scene.add( light )
//     return light
// }
// const light_dist = 200
// var light1 = makePointLight( -light_dist/2, light_dist*2, light_dist/2 )
// var light2 = makePointLight(  light_dist,-light_dist,-light_dist )

var light = new THREE.SpotLight( 0xffffff, 2 )
light.castShadow = true
light.position.set( 10, 400, 10 )
scene.add(light)

light.shadow.mapSize.width  = 1000
light.shadow.mapSize.height = 1000
light.shadow.mapSize.near   = 0.5
light.shadow.mapSize.far    = 1000

// var helper = new THREE.CameraHelper( light.shadow.camera )
// scene.add( helper )

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