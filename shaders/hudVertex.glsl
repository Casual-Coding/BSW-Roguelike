varying vec2 vUv;
uniform float zpos;

void main() {

    vUv = uv;
    vec3 pos = vec3(position.xy, zpos);
    gl_Position = vec4(pos, 1.0);

}