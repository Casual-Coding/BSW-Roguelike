varying vec2 vUv;
uniform vec4 color;
uniform float density;
uniform float size;
varying vec4 vAttr1;
varying vec4 vPosition;
varying vec4 vSPosition;
uniform sampler2D envMap;

void main() {

    float amp = 0.0;

    if ((vAttr1.x+0.0001) > density || length(vUv) > 0.5) {
        amp = 0.0;
    }
    else {
        amp = color.a * 1./(1.+2.*length(vUv));
    }

    float z = (vPosition.z/vPosition.w+256.0) * 256.0;
    float a = mod(z, 1.0);
    float b = mod(floor(z)/256.0, 1.0);
    float c = floor(z/256.0)/256.0;
    gl_FragColor = clamp(vec4(c, b, a, clamp(amp*2., 0., 1.)*0.25), 0., 1.);
}