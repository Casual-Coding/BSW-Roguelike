varying vec4 vClr;
uniform vec4 envMapTint;

void main() {

    if (vClr.a <= 0.0) {
        discard;
    }
    gl_FragColor = vClr;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb, envMapTint.a*0.7);

}