varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform vec4 clr, extra, light;
uniform sampler2D exMap;

uniform sampler2D shadowMap;
uniform vec2 viewport;
uniform vec3 cam;
varying highp vec4 vShadowCoord;
uniform sampler2D envMap, envMap2;
uniform float envMapT;
uniform vec4 envMapTint;
uniform vec4 envMapParam;

#define _F1 (1./16384.0)
#define _F2 (1./16384.0)

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

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);
    blending = vNormal + vec3(1.0, 1.0, 1.0);
    blending = normalize(max(blending, 0.00001));
    float b = (blending.x + blending.y + blending.z);
    blending /= vec3(b, b, b);

    vec3 texCoord = vPosition.xyz / 32.0 * extra.w + vec3(0.5*extra.x/50.0, 1.0*extra.x/50.0, 1.0*extra.x/50.0) + 0.5;
    vec4 clrw = texture2D(exMap, texCoord.xy * extra.y);

    vec3 wNormal = normalize(clrw.xyz);
    vec3 lightDir = light.xyz - vPosition.xyz;

    vec3 envNormal = vNormalMatrix * wNormal;

    float l1w = max(dot(envNormal, normalize(lightDir)), 0.0);

    gl_FragColor.rgb = clr.rgb * (0.2 + 5.0*pow(l1w, 2.0)) * 0.5;
    gl_FragColor.a = clr.a;

    vec3 incident = normalize(vSPosition.xyz);
    vec3 reflected = reflect(incident, envNormal);
    vec2 envCoord = reflected.xy*0.5;
    envCoord.y *= viewport.y/viewport.x;
    envCoord += vec2(0.5, 0.5);
    vec3 envClr = mix(texture2D(envMap, envCoord).rgb*envCoord.x, texture2D(envMap2, envCoord).rgb*envCoord.x, envMapT);
    envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(0.75 + envMapParam.x, 0., 1.));

    highp float Z = vShadowCoord.z - 0.0001;
    highp float zval = Z+0.05;
    if (vShadowCoord.x > 0. && vShadowCoord.y > 0. && vShadowCoord.x < 1. && vShadowCoord.y < 1.) {
        zval = shadowSample1(vShadowCoord.xy);
    }
if (zval < Z) {
        gl_FragColor.rgb *= (1.0 - 1.0) * 0.6 + 0.4;
    }
    else {
        gl_FragColor.rgb *= (1.0 - 1.0 / ((zval-Z)*5000.0+1.0)) * 0.6 + 0.4;
    }
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb*0.25, pow(vSPosition.z/200., 0.5)*envMapTint.a);
}