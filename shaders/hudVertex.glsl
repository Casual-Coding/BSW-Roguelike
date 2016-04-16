varying vec2 vUv;
uniform float zpos;
uniform vec4 scale;

void main() {

    vUv = uv;
    vec3 pos = vec3(
        vec2(
            position.x * scale.x + scale.z,
            position.y * scale.y - scale.w
        ),
        zpos
    );
    gl_Position = vec4(pos, 1.0);

}