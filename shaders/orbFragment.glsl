varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;
varying highp vec4 vShadowCoord;

uniform vec4 clr;
uniform vec4 extra;
uniform float warpIn;
uniform float vreflect;

uniform sampler2D map;
uniform sampler2D dmgMap;
uniform sampler2D shadowMap;
uniform sampler2D envMap, envMap2;
uniform float envMapT;
uniform vec2 viewport;
uniform vec4 envMapTint;
uniform vec4 envMapParam;
uniform float shadowDisabled;

#define _F1 (1./8192.0)
#define _F2 (1./8192.0)

highp float shadowSample(vec2 svp) {
    return texture2D(shadowMap, svp).x;
}

highp float shadowSample1(vec2 svp) {
    highp float ret = texture2D(shadowMap, svp).x * 0.4;
    ret += texture2D(shadowMap, svp - vec2(_F2, 0.0)).x * 0.1;
    ret += texture2D(shadowMap, svp + vec2(_F2, 0.0)).x * 0.1;
    ret += texture2D(shadowMap, svp - vec2(0.0, _F2)).x * 0.1;
    ret += texture2D(shadowMap, svp + vec2(0.0, _F2)).x * 0.1;
    ret += texture2D(shadowMap, svp - vec2(_F2, _F2)).x * 0.05;
    ret += texture2D(shadowMap, svp + vec2(_F2, _F2)).x * 0.05;
    ret += texture2D(shadowMap, svp + vec2(-_F2, _F2)).x * 0.05;
    ret += texture2D(shadowMap, svp + vec2(_F2, -_F2)).x * 0.05;
    return ret;
}

void main() {

    float scale = 0.5 * extra.x;
    float dmg = extra.w;

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);

    vec4 clrn = texture2D(map, vLocal.xy * scale + vec2(0.5, 0.5));
    vec4 clrdn = texture2D(dmgMap, vLocal.xy * 0.1 + vec2(0.5, 0.5));
    vec3 tNormal = reflect(normalize(vNormalMatrix * (normalize(clrn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0))), normalize(vNormal)) * vec3(-1.0, 1.0, 1.0);
    vec3 tNormald = reflect(normalize(vNormalMatrix * (normalize(clrdn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0))), normalize(vNormal)) * vec3(-1.0, 1.0, 1.0);
    vec3 lightDir = normalize(vec3(10., 0, 1.5));

    float l0 = (clrn.a + clrdn.a*dmg)/(1.0+dmg) * 0.35 + 0.65;
    float l1 = pow(max(dot(normalize(tNormal), lightDir), 0.0), 0.5);
    float l1d = pow(max(dot(normalize(tNormald), lightDir), 0.0), 1.5);
    float l2 = clamp(pow(max(dot(normalize(vNormal), lightDir), 0.0), 0.3) + min(pow(topFactor, 2.5), 1.0) * 1.0, 0., 1.);
    float l = min(l0 * (l1*0.8-l1d*0.8*dmg+0.6) * l2 * 1.0, 1.0) / max(length(vSPosition.xy)*0.015 + 0.2, 1.0);
    l = pow(max(l, 0.), 2.0);

    gl_FragColor = vec4(clr.rgb*l, 1.0);
    if (warpIn > 0.9) {
        gl_FragColor = vec4(1., 1., 1., 1.0 - (warpIn - 0.9) / 0.1);
    }
    else {
        gl_FragColor = mix(gl_FragColor, vec4(1.,1.,1.,1.), (warpIn - 0.1) / 0.9);
    }
    if (extra.y > 0.0) {
        float al = pow(sin(vLocal.x * vLocal.y * 30.0 + extra.z*6.0) * 0.5 + 0.5, 0.75) * extra.y * 0.75;
        gl_FragColor = vec4(al*1.0+(1.0-al)*gl_FragColor.r, al*1.0+(1.0-al)*gl_FragColor.g, 0.0*al+(1.0-al)*gl_FragColor.b, 1.0);
    }

    vec3 envNormal = mix(tNormal, tNormald, dmg);
    vec3 incident = normalize(vSPosition.xyz);
    vec3 reflected = reflect(incident, envNormal);
    vec2 envCoord = reflected.xy*0.5;
    envCoord.y *= viewport.y/viewport.x;
    envCoord += vec2(0.5, 0.5);
    vec3 envClr = mix(texture2D(envMap, envCoord).rgb*envCoord.x, texture2D(envMap2, envCoord).rgb*envCoord.x, envMapT);
    envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
    gl_FragColor.rgb = clamp(mix(gl_FragColor.rgb, envClr, clamp(vreflect + envMapParam.x, 0., 0.8)) * 1.25, 0., 1.);

    if (shadowDisabled < 0.5) {
        highp float Z = vShadowCoord.z - 0.001;
        highp float zval = Z+0.05;
        if (vShadowCoord.x > 0. && vShadowCoord.y > 0. && vShadowCoord.x < 1. && vShadowCoord.y < 1.) {
            zval = shadowSample1(vShadowCoord.xy);
        }
        gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
        if (zval < Z) {
            gl_FragColor.rgb *= (1.0 - 1.0) * 0.7 + 0.3;
        }
        else {
            gl_FragColor.rgb *= (1.0 - 1.0 / ((zval-Z)*10000.0+1.0)) * 0.7 + 0.3;
        }
    }
    else {
        gl_FragColor.rgb *= l2;
    }
 }