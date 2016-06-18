precision highp float;

varying vec2 vUv;
uniform float damping;
uniform float time;
uniform float density;
uniform float size;
uniform float speed;
uniform vec3 wind;
uniform vec3 cam;
attribute vec4 attr1;
varying vec4 vAttr1;
varying vec4 vPosition;
varying vec4 vSPosition;

float rand(vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {

    vAttr1 = attr1;

    // Position

    float timeFall = 2.0;
    float fallHeight = 45.0;
    float t2 = time + attr1.y;
    float stage = floor(t2 / timeFall);
    float T = (t2 - stage * timeFall) / timeFall;

    float seed = rand(vec2(attr1.x, sin(stage/16.0))) + attr1.z + attr1.w;
    vec3 ipos = vec3((vec2(rand(vec2(seed, 0.0)), rand(vec2(0.0, seed))) - vec2(0.5, 0.5)) * 400.0, fallHeight);

    // Keep on camera, minimize jumping

    if (ipos.x < (cam.x-50.0)) {
        ipos.x += floor(cam.x / 50.0 + 0.9999) * 50.0;
    }
    else if (ipos.x > (cam.x+50.0)) {
        ipos.x -= floor(-cam.x / 50.0 + 0.9999) * 50.0;
    }
    if (ipos.y < (cam.y-50.0)) {
        ipos.y += floor(cam.y / 50.0 + 0.9999) * 50.0;
    }
    else if (ipos.y > (cam.y+50.0)) {
        ipos.y -= floor(-cam.y / 50.0 + 0.9999) * 50.0;
    }

    // Fall

    ipos.z -= T * (fallHeight + 15.0);

    // Output position

    vec3 pos1 = position;
    pos1.z *= (10./60.) * (speed-0.1) * (fallHeight + 15.0);
    vec3 pos2 = pos1 * size + ipos;
    vPosition = modelMatrix * vec4(pos2, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos2, 1.0);
    vSPosition = gl_Position;
    
    // UV
    vUv = position.xy;
}