varying vec2 vUv;
uniform vec4 color;
uniform float density;
uniform float size;
varying vec4 vAttr1;
varying vec4 vPosition;
varying vec4 vSPosition;
varying float sZ;
uniform sampler2D envMap;

void main() {

    float amp = 0.0;

    if ((vAttr1.x+0.0001) > density || length(vUv) > 0.5) {
        amp = 0.0;
    }
    else {
        amp = color.a * 1./(1.+2.*length(vUv));
    }

    float z = sZ * 64.0;
    float a = mod(z, 1.0);
    float b = mod(floor(z)/64.0, 1.0);
    float c = floor(z/64.0)/64.0;
    gl_FragColor = vec4(c, b, a, 1.0);
}