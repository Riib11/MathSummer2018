var getWidth    = function() { return window.innerWidth }
var getHeight   = function() { return window.innerHeight }
var getPixRatio = function() { return window.devicePixelRatio }

//
/////////////////////////////////////////
// MATH
/////////////////////////////////////////
//

function cart_to_pol(x,y) {
    let expr = Math.sqrt( Math.pow(x,2) + Math.pow(y,2) )
    let atan = Math.atan2(y,x)
    if (!atan) { atan = 0 }
    return [ expr   // r
           , atan ] // t
}

function pol_to_cart(r,t) {
    return [ r * Math.cos(t)   // x
           , r * Math.sin(t) ] // y
}


// function cart_to_uv(x,y) {
//     return [  ,  ]
// }

function uv_to_cart(u,v) {
    return [ Math.pow(u,2)-Math.pow(v,2)
           , 2*u*v ]
}


function id2(a,b) { return [a,b] }

function constant(x) { return function() { return x }}


function vec2_add(x,y) { return [ x[0]+y[0], x[1]+y[1] ] }
function vec2_sub(x,y) { return [ x[0]-y[0], x[1]-y[1] ] }

function lintrans2_apply(t, v) {
    let
        a=t[0], b=t[1], c=t[2], d=t[3],
        x=v[0], y=v[1]
    return [ a*x + b*y , c*x + d*y ]
}