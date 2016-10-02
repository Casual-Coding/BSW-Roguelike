varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;
varying vec4 vShadowCoord;

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

    float l0 = (clrn.a + clrdn.a*dmg)/(1.0+dmg) * 0.25 + 0.75;
    float l1 = pow(max(dot(normalize(tNormal), lightDir), 0.0), 0.7);
    float l1d = pow(max(dot(normalize(tNormald), lightDir), 0.0), 0.7);
    float l2 = (pow(max(dot(normalize(vNormal), lightDir), 0.0), 3.0) + pow(topFactor, 2.5)) * 0.5;
    float l = min(l0 * ((l1*0.8-l1d*0.6*dmg+0.6) * l2) * 1.0, 1.0) / max(length(vSPosition.xy)*0.015 + 0.2, 0.75);
    l = pow(max(l, 0.), 2.5) + 0.2;

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
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(vreflect + envMapParam.x, 0., 1.));

    vec2 svp = vShadowCoord.xy + vec2(1./512., 0.);
    vec4 svec = vec4(0., 0., 0., 1.);
    float Z = vPosition.z / vPosition.w;
    float zval = Z-0.05;
    if (svp.x > 0. && svp.y > 0. && svp.x < 1. && svp.y < 1.) {
        vec4 SA = texture2D(shadowMap, svp);
        vec4 SB = texture2D(shadowMap, svp - vec2(1./2048., 0.)); 
        vec4 SC = texture2D(shadowMap, svp + vec2(1./2048., 0.));
        vec4 SD = texture2D(shadowMap, svp - vec2(0., 1./2048.));
        vec4 SE = texture2D(shadowMap, svp + vec2(0., 1./2048.));
        float ZA = (SA.r * 65536.0 + SA.g * 256.0 + SA.b) / 256.0 - 256.0;
        float ZB = (SB.r * 65536.0 + SB.g * 256.0 + SB.b) / 256.0 - 256.0;
        float ZC = (SC.r * 65536.0 + SC.g * 256.0 + SC.b) / 256.0 - 256.0;
        float ZD = (SD.r * 65536.0 + SD.g * 256.0 + SD.b) / 256.0 - 256.0;
        float ZE = (SE.r * 65536.0 + SE.g * 256.0 + SE.b) / 256.0 - 256.0;
        zval = (ZA+ZB+ZC+ZD+ZE) / 5.0 - 0.05;
        svec.a = (SA.a + SB.a + SC.a + SD.a + SE.a) / 5.0;
    }
    if (zval > Z) {
        gl_FragColor.rgb *= (1.0 - svec.a) * 0.85 + 0.15;
    }
    else {
        gl_FragColor.rgb *= (1.0 - svec.a / ((Z-zval)*50.+1.0)) * 0.85 + 0.15;
    }
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
}