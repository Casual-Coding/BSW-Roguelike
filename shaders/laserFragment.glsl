uniform vec4 clr;
uniform vec4 laser;

varying vec3 vLocal;

void main() {

    float d = pow(max(1.0 - min(abs(vLocal.x) / laser.y, 1.0), 0.0), 0.9);
    if (vLocal.y > laser.x) {
        d /= pow(1.0 + abs(vLocal.y - laser.x), 6.0);
    }
    if (d < 0.01) {
        d = 0.0;
    }
    
    gl_FragColor = clr * d;

}