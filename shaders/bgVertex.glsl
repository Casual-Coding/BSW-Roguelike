uniform vec3 pos;
uniform vec3 sza;
varying vec2 vUv;

void main() {

    vUv = uv;
    float ca = cos(sza.z), sa = sin(sza.z);
    vec2 xy = vec2(
        sza.x * (ca * position.x - sa * position.y) + pos.x,
        sza.y * (ca * position.y + sa * position.x) + pos.y
    );
    gl_Position = vec4(xy, 0.99 + pos.z * 0.001, 1.0);

}