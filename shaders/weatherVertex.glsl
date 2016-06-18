precision highp float;

varying vec2 vUv;
uniform float damping;
uniform float time;
uniform float density;
uniform float size;
uniform vec3 wind;
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

    float timeFall = 4.0;
    float fallHeight = 50.0;
    float t2 = time + attr1.y;
    float stage = floor(t2 / timeFall);
    float T = (t2 - stage * timeFall) / timeFall;

    float seed = rand(vec2(attr1.x, sin(stage/16.0))) + attr1.z + attr1.w;
    vec3 ipos = vec3((vec2(rand(vec2(seed, 0.0)), rand(vec2(0.0, seed))) - vec2(0.5, 0.5)) * 100.0, fallHeight);

    ipos.z -= T * (fallHeight + 10.0);

    vec3 pos2 = position * size + ipos;

    vPosition = modelMatrix * vec4(pos2, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos2, 1.0);
    vSPosition = gl_Position;
    
    // UV
    vUv = position.xy;
}