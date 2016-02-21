uniform vec4 clr;

void main() {

    if (clr.a <= 0.0) {
        discard;
    }
    gl_FragColor.rgba = clr.rgba;

}