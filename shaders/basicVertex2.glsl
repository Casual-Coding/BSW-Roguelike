varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vLocal;
varying vec4 vPosition;
varying mat3 vNormalMatrix;
varying mat4 vNormalMatrix2;
varying vec4 vSPosition;
varying float vFragDepth;
varying highp vec4 vShadowCoord;
varying vec2 vN;
uniform mat4 shadowMatrix;

void main() {

    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = modelMatrix * vec4( position, 1.0 );
    vLocal = position;
    vNormalMatrix = normalMatrix;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vSPosition = gl_Position;
    vFragDepth = gl_Position.z/gl_Position.w;
    mat4 biasMatrix;
    biasMatrix[0] = vec4(0.5, 0.0, 0.0, 0.0);
    biasMatrix[1] = vec4(0.0, 0.5, 0.0, 0.0);
    biasMatrix[2] = vec4(0.0, 0.0, 0.5, 0.0);
    biasMatrix[3] = vec4(0.5, 0.5, 0.5, 1.0);
    vShadowCoord = (biasMatrix * shadowMatrix) * (modelMatrix * vec4(position, 1.0)) + vec4(1./2048., 1./4096., 0., 0.);
}