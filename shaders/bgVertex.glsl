varying vec2 vUv;
uniform float zpos;

void main() {

    vUv = uv;
    gl_Position = vec4(position.xy, zpos, 1.0);

}