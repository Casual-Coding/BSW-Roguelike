uniform vec4 clr;

void main() {

    gl_FragColor.rgb = clr.rgb * clr.a;
    gl_FragColor.a = 1.0;

}