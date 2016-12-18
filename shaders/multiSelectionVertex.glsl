varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vLocal;
varying vec4 vPosition;
varying mat3 vNormalMatrix;
varying vec4 vSPosition;
varying float vFragDepth;
varying vec4 clr;

attribute vec4 aPosRot;
attribute vec4 aClr;

void main() {

    clr = aClr;

    float ca = cos(-aPosRot.w), sa = sin(-aPosRot.w);
    mat3 rotMatrix;
    rotMatrix[0] = vec3( ca, -sa, 0.0);
    rotMatrix[1] = vec3( sa,  ca, 0.0);
    rotMatrix[2] = vec3(0.0, 0.0, 1.0);
    
    vUv = uv;
    vNormal = normalize(rotMatrix * normal);
    vPosition = vec4(rotMatrix * position, 1.0);
    vLocal = position;
    vNormalMatrix = rotMatrix;
    gl_Position = projectionMatrix * viewMatrix * vec4(vPosition.xyz + aPosRot.xyz, 1.0);
    vSPosition = gl_Position;
    vFragDepth = (gl_Position.z/gl_Position.w) * 0.5 + 0.5;

}