varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vLocal;
varying vec4 vPosition;
varying mat3 vNormalMatrix;

void main() {

    vUv = uv;
    vNormal = normalMatrix * normal;
    vPosition = modelMatrix * vec4( position, 1.0 );
    vLocal = position;
    vNormalMatrix = normalMatrix;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}