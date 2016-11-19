varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vLocal;
varying vec4 vPosition;
varying mat3 vNormalMatrix;
varying mat4 vNormalMatrix2;
varying vec4 vSPosition;
varying float vFragDepth;
varying vec4 vShadowCoord;
varying vec2 vN;
varying float vShadowZ;
uniform mat4 shadowMatrix;

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

void main() {

    vUv = uv;
    vNormal = normalMatrix * normal;
    vNormalMatrix2 = rotationMatrix(vNormal, 0.0);
    vPosition = modelMatrix * vec4( position, 1.0 );
    vLocal = position;
    vNormalMatrix = normalMatrix;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vSPosition = gl_Position;
    vFragDepth = (gl_Position.z / gl_Position.w) * 0.5 + 0.5;
    mat4 biasMatrix;
    biasMatrix[0] = vec4(0.5, 0.0, 0.0, 0.0);
    biasMatrix[1] = vec4(0.0, 0.5, 0.0, 0.0);
    biasMatrix[2] = vec4(0.0, 0.0, 0.5, 0.0);
    biasMatrix[3] = vec4(0.5, 0.5, 0.5, 1.0);
    vShadowCoord = shadowMatrix * modelMatrix * vec4(position, 1.0);
    vShadowZ = ((vShadowCoord.z/vShadowCoord.w)*0.5+0.5) - 0.0011;
    vShadowCoord = biasMatrix * vShadowCoord;

    vec3 r = vNormal.xyz;//reflect( normalize(vSPosition.xyz), normalize(vNormal.xyz) );
    float m = 2. * sqrt( 
        pow( r.x, 2. ) + 
        pow( r.y, 2. ) + 
        pow( r.z + 1., 2. ) 
    );
    vN = r.xy / m + .5;

}