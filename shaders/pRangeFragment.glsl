uniform vec4 clr;
varying vec3 vLocal;

void main() {

    gl_FragColor = clr;
    gl_FragColor.a /= (1.0 + abs(vLocal.z)*2.0);

}