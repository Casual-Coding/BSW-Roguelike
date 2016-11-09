uniform vec4 clr;
uniform vec4 extra;

varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying float vFragDepth;

void main() {

    gl_FragColor = clamp(clr, 0., 1.);
    gl_FragColor.a *= pow(clamp(1.0 - abs(vPosition.z*0.25*(1.0/extra.x)), 0., 0.9), 2.0);

}