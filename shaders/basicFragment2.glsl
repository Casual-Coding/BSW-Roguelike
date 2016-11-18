varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;
varying vec4 vShadowCoord;
varying float vShadowZ;

uniform sampler2D map;
uniform sampler2D dmgMap;
uniform vec4 light;
uniform vec4 clr;
uniform vec4 extra;
uniform float warpIn;
uniform sampler2D shadowMap;
uniform sampler2D envMap, envMap2;
uniform float envMapT;
uniform vec2 viewport;
uniform float vreflect;
uniform vec4 envMapTint;
uniform vec4 envMapParam;

#define _F1 (1./16384.0)
#define _F2 (1./16384.0)

vec2 shadowSample(vec2 svp) {
    vec4 SA = texture2D(shadowMap, svp);
    float ZA = (SA.r * 4096.0 + SA.g * 64.0 + SA.b) / 64.0;
    return vec2(ZA, SA.a);  
}

vec2 shadowSample1(vec2 svp) {
    vec2 ret = shadowSample(svp);
    ret += shadowSample(svp - vec2(_F2, 0.0));
    ret += shadowSample(svp + vec2(_F2, 0.0));
    ret += shadowSample(svp - vec2(0.0, _F2));
    ret += shadowSample(svp + vec2(0.0, _F2));
    ret += shadowSample(svp - vec2(_F2, _F2));
    ret += shadowSample(svp + vec2(_F2, _F2));
    ret += shadowSample(svp + vec2(-_F2, _F2));
    ret += shadowSample(svp + vec2(_F2, -_F2));
    ret /= 9.0;
    return ret;
}

vec2 shadowSample2(vec2 svp) {
    vec2 ret = shadowSample1(svp);
    ret += shadowSample1(svp - vec2(_F1, 0.0));
    ret += shadowSample1(svp + vec2(_F1, 0.0));
    ret += shadowSample1(svp - vec2(0.0, _F1));
    ret += shadowSample1(svp + vec2(0.0, _F1));
    ret += shadowSample1(svp - vec2(_F1, _F1));
    ret += shadowSample1(svp + vec2(_F1, _F1));
    ret += shadowSample1(svp + vec2(-_F1, _F1));
    ret += shadowSample1(svp + vec2(_F1, -_F1));
    ret /= 9.0;
    return ret;
}

void main() {

    float scale = 0.5 * extra.x;
    float dmg = extra.w;

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);

    vec4 clrn = texture2D(map, vLocal.xy * scale + vec2(0.5, 0.5));
    vec4 clrdn = texture2D(dmgMap, vLocal.xy * 0.1 + vec2(0.5, 0.5));
    vec3 tNormal = vNormalMatrix * (normalize(clrn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0));
    vec3 tNormald = vNormalMatrix * (normalize(clrdn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0));
    vec3 lightDir = normalize(light.xyz - vPosition.xyz);

    float l0 = (clrn.a + clrdn.a*dmg)/(1.0+dmg) * 0.35 + 0.65;
    float l1 = pow(max(dot(normalize(tNormal), lightDir), 0.0), 1.0);
    float l1d = pow(max(dot(normalize(tNormald), lightDir), 0.0), 1.0);
    float l2 = pow(max(dot(normalize(vNormal), lightDir), 0.0), 0.3) + min(pow(topFactor, 2.5), 1.0) * 0.5;
    float l = min(l0 * (l1*0.8-l1d*0.8*dmg+0.6) * l2 * 1.0, 1.0) / max(length(vSPosition.xy)*0.015 + 0.2, 1.0);
    l = pow(max(l, 0.), 3.0);

    if (warpIn > 0.9) {
        gl_FragColor = vec4(1., 1., 1., 1.0 - (warpIn - 0.9) / 0.1);
    }
    else {
        gl_FragColor = mix(gl_FragColor, vec4(1.,1.,1.,1.), (warpIn - 0.1) / 0.9);
    }

    gl_FragColor = vec4(clr.rgb*l, 1.0);
    if (extra.y > 0.0) {
        float al = pow(sin(vLocal.x * vLocal.y * 30.0 + extra.z*6.0) * 0.5 + 0.5, 0.75) * extra.y * 0.75;
        gl_FragColor = vec4(al*1.0+(1.0-al)*gl_FragColor.r, al*1.0+(1.0-al)*gl_FragColor.g, 0.0*al+(1.0-al)*gl_FragColor.b, 1.0);
    }

    vec3 envNormal = (vNormalMatrix * mix(tNormal, tNormald, dmg)).xyz;
    vec3 incident = normalize(vSPosition.xyz);
    vec3 reflected = reflect(incident, envNormal);
    vec2 envCoord = reflected.xy*0.5;
    envCoord.y *= viewport.y/viewport.x;
    envCoord += vec2(0.5, 0.5);
    vec3 envClr = mix(texture2D(envMap, envCoord).rgb, texture2D(envMap2, envCoord).rgb, envMapT);
    envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(vreflect + envMapParam.x, 0., 0.85));

    vec2 svp = vShadowCoord.xy + vec2(1./512., 0.);
    vec4 svec = vec4(0., 0., 0., 1.);
    float Z = vShadowZ;
    float zval = Z-0.05;
    if (svp.x > 0. && svp.y > 0. && svp.x < 1. && svp.y < 1.) {
        vec2 ret = shadowSample2(svp);
        zval = ret.x;
        svec.a = ret.y;
    }
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
    if (zval < Z) {
        gl_FragColor.rgb *= (1.0 - svec.a) * 0.7 + 0.3;
    }
    else {
        gl_FragColor.rgb *= (1.0 - svec.a / ((zval-Z)*10000.0+1.0)) * 0.7 + 0.3;
    }
    gl_FragColor.rgb *= l2 * 0.75 + 0.25;
}