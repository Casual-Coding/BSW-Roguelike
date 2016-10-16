uniform vec4 clr;
uniform vec4 warp;

varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying float vFragDepth;

void main() {

    gl_FragColor = clamp(clr, 0., 1.);

    if (warp.x > 0.0) {
        gl_FragColor.a *= sin(length(vNormal + vPosition.xyz) + warp.y*5.0) * 0.25 + 0.75;
        gl_FragColor.rgb *= clamp(vPosition.z, 0.5, 1.0);
    }

}