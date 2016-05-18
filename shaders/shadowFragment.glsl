varying vec4 vPosition;

void main() {
    float z = (vPosition.z+256.0) * 256.0;
    float a = mod(z, 1.0);
    float b = mod(floor(z)/256.0, 1.0);
    float c = floor(z/256.0)/256.0;
    gl_FragColor = vec4(c, b, a, 1.0);
}