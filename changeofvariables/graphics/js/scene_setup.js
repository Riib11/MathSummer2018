//
/////////////////////////////////////////
// Document Setup
/////////////////////////////////////////
//

var getWidth    = function() { return window.innerWidth }
var getHeight   = function() { return window.innerHeight }
var getPixRatio = function() { return window.devicePixelRatio }

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
var canvas = document.getElementById("canvas")
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