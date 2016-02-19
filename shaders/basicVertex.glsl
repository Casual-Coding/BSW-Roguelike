varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;

void main() {

    vUv = uv;
    vNormal = normalMatrix * normal;
    vPosition = modelMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}