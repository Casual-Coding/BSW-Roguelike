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

    vec3 pos = position.xyz;
    vUv = uv;
    vNormal = normalMatrix * normal;
    vPosition = modelMatrix * vec4( pos, 1.0 );
    vLocal = position;
    vNormalMatrix = normalMatrix;
    vec4 tmp = modelViewMatrix * vec4( pos, 1.0 );
    //gl_Position.xy = TO_SCREEN(tmp.xy, 1.45*cam.z);
    float zf = cam.z * 70.0;
    gl_Position = projectionMatrix * ((modelViewMatrix * vec4( position, 1.0 )) * vec4(1.0*zf, 1.0*zf, 0.2*zf, 1.0) + vec4(0.0, 0.0, -45.0, 0.0));
    //gl_Position.z = gl_Position.z/100000.0;
    vSPosition = gl_Position;
}