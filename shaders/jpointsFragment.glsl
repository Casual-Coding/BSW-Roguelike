varying vec4 vClr;

void main() {

    if (vClr.a <= 0.0) {
        discard;
    }
    gl_FragColor = vClr;

}