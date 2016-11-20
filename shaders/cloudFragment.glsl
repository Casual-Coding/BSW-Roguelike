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

    gl_FragColor.a = clr.a * (0.25*texture2D(texture, vLocal.xy/1.5 + vec2(.1,.25)).a+0.75);
    gl_FragColor.rgb = mix(clr.rgb * (texture2D(texture, vLocal.xy/0.75).a*0.25+0.75), envMapTint.rgb, envMapTint.a);

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);
    vec3 lightDir = normalize(vec3(10., 0, 3.));
    float l2 = pow(max(dot(normalize(vNormal), lightDir), 0.0), 0.3) + min(pow(topFactor, 2.5), 1.0) * 0.5;

    gl_FragColor.rgb -= 0.1;
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);

    float Z = vShadowCoord.z - 0.0001;
    highp float zval = Z+0.05;
    if (vShadowCoord.x > 0. && vShadowCoord.y > 0. && vShadowCoord.x < 1. && vShadowCoord.y < 1.) {
        zval = shadowSample1(vShadowCoord.xy);
    }
    if (zval < Z) {
        gl_FragColor.rgb *= (1.0 - 1.0) * 0.5 + 0.5;
    }
    else {
        gl_FragColor.rgb *= (1.0 - 1.0 / ((zval-Z)*5000.0+1.0)) * 0.5 + 0.5;
    }

    if (vPosition.z > 0.0) {
        gl_FragColor.rgb /= (vPosition.z*15.0 + 1.0);
    }
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb, pow(vSPosition.z/200., 0.5)*envMapTint.a);

    gl_FragColor.rgb *= l2 * 0.75 + 0.25;
}