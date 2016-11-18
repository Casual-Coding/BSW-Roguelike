varying vec4 vPosition;
varying float sZ;

void main() {
    float z = sZ * 64.0;
    float a = mod(z, 1.0);
    float b = mod(floor(z)/64.0, 1.0);
    float c = floor(z/64.0)/64.0;
    gl_FragColor = vec4(c, b, a, 1.0);
}