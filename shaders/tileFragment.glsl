varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

//uniform sampler2D map;
uniform sampler2D exMap;
uniform vec4 light, clr, extra;

uniform sampler2D shadowMap;
uniform vec2 viewport;
uniform vec3 cam;
varying float vFragDepth;
varying vec4 vShadowCoord;

void main() {

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);
    blending = vNormal + vec3(1.0, 1.0, 1.0);
    blending = normalize(max(blending, 0.00001));
    float b = (blending.x + blending.y + blending.z);
    blending /= vec3(b, b, b);

    vec3 texCoord = vPosition.xyz / 32.0 * extra.w;
    vec4 clrw = texture2D(exMap, texCoord.xy) * blending.z * 2.0 +
                texture2D(exMap, texCoord.xz) * blending.y * 0.5 + 
                texture2D(exMap, texCoord.yz) * blending.x * 0.5;
    clrw = clamp(clrw, 0.0, 1.0);
    clrw = vec4(pow(clrw.r, 2.0), pow(clrw.g, 2.0), pow(clrw.b, 2.0), pow(clrw.a, 2.0));

    //vec4 clrn = texture2D(map, vUv);
    //vec3 tNormal = vNormalMatrix * (normalize(clrn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0));
    vec3 lightDir = normalize(light.xyz - vPosition.xyz);

    vec4 clrn = vec4(0.5, 0.5, 0.5, 0.5);

    clrn.w = clrn.w * 0.5 * extra.z + 0.5;

    float l0 = clrn.a * 0.5 + 0.5 * pow(clrw.a, 2.0);
    float l1 = pow(max(dot(normalize((normalize(clrw.xyz) * 2.0 - vec3(1., 1., 1.))), lightDir), 0.0), 0.7) * extra.z;
    float l2 = (pow(max(dot(normalize(vNormal), lightDir), 0.0), 3.0) + pow(topFactor, 2.5)) * 0.5;
    float l = min(l0 * ((l1*0.4+0.4) * l2) * 1.0, 1.0) / max(length(vSPosition.xy)*0.015 + 0.2, 0.75);
    l = pow(max(l, 0.0), 2.0) + 0.3;

    gl_FragColor = vec4(clr.rgb*l, 1.0);

    vec2 svp = vShadowCoord.xy + vec2(1./512., 0.);
    vec4 svec = vec4(0., 0., 0., 1.);
    float Z = vPosition.z / vPosition.w;
    float zval = Z-0.01;
    if (svp.x > 0. && svp.y > 0. && svp.x < 1. && svp.y < 1.) {
        svec = (texture2D(shadowMap, svp) * 0.75
             + texture2D(shadowMap, svp - vec2(1./2048., 0.)) * 0.0625 
             + texture2D(shadowMap, svp + vec2(1./2048., 0.)) * 0.0625
             + texture2D(shadowMap, svp - vec2(0., 1./2048.)) * 0.0625
             + texture2D(shadowMap, svp + vec2(0., 1./2048.)) * 0.0625);
        zval = (svec.r * 65536.0 + svec.g * 256.0 + svec.b) / 256.0 - 256.0;
    }
    if (zval > (Z-0.01)) {
        gl_FragColor.rgb *= (1.0 - svec.a) * 0.75 + 0.25;
    }
    else {
        gl_FragColor.rgb *= (1.0 - svec.a / (((Z-0.01)-zval)*7.5+1.0)) * 0.75 + 0.25;
    }
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);

}