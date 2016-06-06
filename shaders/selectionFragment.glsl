uniform vec4 clr;

void main() {

    gl_FragColor = clamp(clr, 0., 1.);

}