varying vec4 clr;

varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying float vFragDepth;

void main() {

    gl_FragColor = clamp(clr, 0., 1.);

    if (gl_FragColor.a < 0.00001) {
        discard;
    }

}