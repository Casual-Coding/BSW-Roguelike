uniform vec3 cam;
uniform vec2 vp;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vLocal;
varying vec4 vPosition;
varying mat3 vNormalMatrix;
varying vec4 vSPosition;

#define TO_SCREEN(P, Z) (((P) - cam.xy) * vec2(vp.y/vp.x, 1.0) * (Z))

void main() {

    vec3 pos = vec3(position.x, position.y, position.z);
    vUv = uv;
    vNormal = normalMatrix * normal;
    vPosition = modelMatrix * vec4( pos, 1.0 );
    vLocal = position;
    vNormalMatrix = normalMatrix;
    vec4 tmp = modelViewMatrix * vec4( pos, 1.0 );
    //gl_Position = projectionMatrix * tmp;
    gl_Position.xy = TO_SCREEN(tmp.xy, 1.65*cam.z);
    gl_Position.z = 0.995-tmp.z/100000.0;
    gl_Position.w = 1.0;
    vSPosition = gl_Position;
}