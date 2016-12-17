varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vLocal;
varying vec4 vPosition;
varying mat3 vNormalMatrix;
varying vec4 vSPosition;
varying float vFragDepth;
varying highp vec4 vShadowCoord;
varying vec2 vN;
uniform mat4 shadowMatrix;

attribute vec4 aPosRot;
attribute vec4 aClr, aExtra;
attribute vec3 aWarpInVReflect;

varying vec4 clr;
varying vec4 extra;
varying float warpIn;
varying float vreflect;

void main() {

    clr = aClr;
    extra = aExtra;
    warpIn = aWarpInVReflect.x;
    vreflect = aWarpInVReflect.y;

    vUv = uv;
    float ca = cos(-aPosRot.w), sa = sin(-aPosRot.w);
    mat3 rotMatrix;
    rotMatrix[0] = vec3( ca, -sa, 0.0);
    rotMatrix[1] = vec3( sa,  ca, 0.0);
    rotMatrix[2] = vec3(0.0, 0.0, 1.0);
    vNormal = normalize(rotMatrix * normal);
    vPosition = vec4(rotMatrix * position, 1.0);
    vLocal = position;
    vNormalMatrix = rotMatrix;
    gl_Position = projectionMatrix * viewMatrix * vec4(vPosition.xyz + aPosRot.xyz, 1.0);
    vSPosition = gl_Position;
    vFragDepth = gl_Position.z/gl_Position.w;
    mat4 biasMatrix;
    biasMatrix[0] = vec4(0.5, 0.0, 0.0, 0.0);
    biasMatrix[1] = vec4(0.0, 0.5, 0.0, 0.0);
    biasMatrix[2] = vec4(0.0, 0.0, 0.5, 0.0);
    biasMatrix[3] = vec4(0.5, 0.5, 0.5, 1.0);
    vShadowCoord = (biasMatrix * shadowMatrix) * vec4(vPosition.xyz + aPosRot.xyz, 1.0) + vec4(1./2048., 1./4096., 0., 0.);
}