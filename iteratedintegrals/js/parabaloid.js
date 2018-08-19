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
    var canvas = document.getElementById("canvas2")
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
    // Trackball control2_ler
    /////////////////////////////////////////

    var control2_s = new THREE.TrackballControls( camera, renderer.domElement )
    control2_s.rotateSpeed = 10.0
    control2_s.zoomSpeed = 0;//3.2
    control2_s.panSpeed = 0.8
    control2_s.noZoom = false
    control2_s.noPan = true
    control2_s.staticMoving = false
    control2_s.dynamicDampingFactor = 0.2

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
    // var control2__axes = document.getElementById("control2__axes")
    // control2__axes.addEventListener("change", updateAxes)
    // updateAxes({ target2_:control2__axes })

    // slices

    const scale = 150
    const coo_x = 1
    const coo_z = 0.25

    var y = function(x,z) {
        var term_x = coo_x * Math.pow(x,2)
        var term_z = coo_z * Math.pow(z,2)
        return Math.sqrt(1 - term_x - term_z)
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

        const zrange = 2
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
        const target2_1_x = document.getElementById("target2_1_x")
        const target2_1_z = document.getElementById("target2_1_z")

        function updatetarget2_1(x,z) {
            katex.render(" x = " + format3dec(x), target2_1_x)
            katex.render(" y = " + format3dec(z), target2_1_z)
        }

        //
        // control2_ sliders
        //
        const control2__x = document.getElementById("control2_1_x")
        function updatecontrol2_X(evt) {
            const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
            const value = target2_.value
            const radius = y_slicez(0)
            slider_x = value * radius
            updateSlices()
            render()
            updatetarget2_1(slider_x, slider_z)
        }
        control2__x.addEventListener("input", updatecontrol2_X)
        updatecontrol2_X({ target2_:control2__x })

        const control2__z = document.getElementById("control2_1_z")
        function updatecontrol2_Z(evt) {
            var target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
            var value = target2_.value
            slider_z = value * zrange
            updateSlices()
            render()
            updatetarget2_1(slider_x, slider_z)
        }
        control2__z.addEventListener("input", updatecontrol2_Z)
        updatecontrol2_Z({ target2_:control2__z })

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
            const radius = y_slicex(0)*2
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
        const target2_2_x = document.getElementById("target2_2_x")
        const target2_2_z = document.getElementById("target2_2_z")

        function updatetarget2_2(x,z) {
            katex.render(" x = " + format3dec(x), target2_2_x)
            katex.render(" y = " + format3dec(z), target2_2_z)
        }

        //
        // control2_
        //
        const control2__x = document.getElementById("control2_2_x")
        function updatecontrol2_X(evt) {
            const target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
            const value = target2_.value
            slider_x = xrange * value
            updateSlices()
            render()
            updatetarget2_2(slider_x, slider_z)
        }
        control2__x.addEventListener("input", updatecontrol2_X)
        updatecontrol2_X({ target2_:control2__x })

        const control2__z = document.getElementById("control2_2_z")
        function updatecontrol2_Y(evt) {
            var target2_ = (evt.target2_) ? evt.target2_ : evt.srcElement
            var value = target2_.value
            const radius = y_slicex(0)
            slider_z = radius * value
            updateSlices()
            render()
            updatetarget2_2(slider_x, slider_z)
        }
        control2__z.addEventListener("input", updatecontrol2_Y)
        updatecontrol2_X({ target2_:control2__z })

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
    stlloader.load( 'models/parabaloid.stl', function ( geometry ) {
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

    // const control2__opacity = document.getElementById("control2__opacity")
    // const opacity_display = document.getElementById("opacity_display")

    // control2__opacity.addEventListener("input", function() {
    //     volume.material.opacity = control2__opacity.value
    //     opacity_display.innerText = control2__opacity.value
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
    // var control2__plane = document.getElementById("control2__plane")
    // control2__plane.addEventListener("change", updatePlane)
    // updatePlane({ target2_:control2__plane })

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
        control2_s.update()
        requestAnimationFrame(update)
    }

    control2_s.addEventListener( 'change', render )
    requestAnimationFrame(update)

    /////////////////////////////////////////
    // Window Resizing
    /////////////////////////////////////////

    // window.addEventListener( 'resize', function () {
    //     camera.aspect = window.innerWidth / window.innerHeight
    //     camera.updateProjectionMatrix()
    //     renderer.setSize( window.innerWidth, window.innerHeight )
    //     control2_s.handleResize()
    //     render()
    // }, false )

})()