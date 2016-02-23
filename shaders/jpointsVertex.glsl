attribute vec4 clr;
attribute vec4 pos;

varying vec4 vClr;

void main() {

    float ca = cos(pos.z), sa = sin(pos.z);
    vec3 pos2 = vec3(
        (position.x * ca - position.y * sa) * pos.w + pos.x,
        (position.y * ca + position.x * sa) * pos.w + pos.y,
        position.z * pos.w
    );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos2, 1.0 );
    vClr = clr;

}