varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform vec4 clr;
uniform float tScale;

uniform sampler2D shadowMap, texture;
varying vec4 vShadowCoord;

uniform vec4 envMapTint;
uniform vec4 envMapParam;

#define _F1 (1./16384.0)
#define _F2 (1./16384.0)

highp float shadowSample(vec2 svp) {
    return texture2D(shadowMap, svp).x;
}

highp float shadowSample1(vec2 svp) {
    highp float ret = texture2D(shadowMap, svp).x;
    ret += texture2D(shadowMap, svp - vec2(_F2, 0.0)).x;
    ret += texture2D(shadowMap, svp + vec2(_F2, 0.0)).x;
    ret += texture2D(shadowMap, svp - vec2(0.0, _F2)).x;
    ret += texture2D(shadowMap, svp + vec2(0.0, _F2)).x;
    ret += texture2D(shadowMap, svp - vec2(_F2, _F2)).x;
    ret += texture2D(shadowMap, svp + vec2(_F2, _F2)).x;
    ret += texture2D(shadowMap, svp + vec2(-_F2, _F2)).x;
    ret += texture2D(shadowMap, svp + vec2(_F2, -_F2)).x;
    ret /= 9.0;
    return ret;
}

void main() {

    vec4 clrw = texture2D(texture, vUv);

    gl_FragColor = clr;

    vec3 lightDir = normalize(vec3(10., 0, 3.));
    vec3 tNormal = normalize(reflect(normalize(vNormalMatrix * (clrw.xyz * 2.0 - vec3(1.0, 1.0, 1.0))), vNormalMatrix * normalize(vLocal)) * vec3(1.0, 1.0, 1.0));
    
    float l = max(dot(tNormal, lightDir), 0.0) * 0.75 + 0.25;
    gl_FragColor = vec4(clr.rgb*l*pow(clrw.a, 0.2)*0.75, pow(clrw.a, 0.85)*0.625);
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);

    float Z = vShadowCoord.z - 0.001;
    highp float zval = Z+0.05;
    if (vShadowCoord.x > 0. && vShadowCoord.y > 0. && vShadowCoord.x < 1. && vShadowCoord.y < 1.) {
        zval = shadowSample1(vShadowCoord.xy);
    }
    if (zval < Z) {
        gl_FragColor.rgb *= (1.0 - 1.0) * 0.25 + 0.75;
    }
    else {
        gl_FragColor.rgb *= (1.0 - 1.0 / ((zval-Z)*10000.0+1.0)) * 0.25 + 0.75;
    }

    if (vPosition.z > 0.0) {
        gl_FragColor.rgb /= (vPosition.z*15.0 + 1.0);
    }
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb, pow(vSPosition.z/200., 0.5)*envMapTint.a);
}