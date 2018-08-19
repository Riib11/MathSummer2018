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
var canvas = document.getElementById("canvas")
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
var axesHelper = new THREE.AxesHelper( 700 );
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



