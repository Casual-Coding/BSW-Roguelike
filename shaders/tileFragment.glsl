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
uniform sampler2D envMap, envMap2;
uniform float envMapT;
uniform vec2 viewport;
uniform vec3 cam;
uniform float vreflect, waterLevel;
uniform vec4 waterClr;
varying highp vec4 vShadowCoord;

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

    vec3 blending = normalize(abs(vNormal));
    float b = max(blending.x + blending.y + blending.z, 0.0001);
    float topFactor = blending.z / b;
    blending /= vec3(b, b, b);

    vec3 texCoord = vPosition.xyz / 8.0 * extra.w;
    vec4 clrw = texture2D(exMap, texCoord.xy) * blending.z +
                texture2D(exMap, texCoord.xz) * blending.y + 
                texture2D(exMap, texCoord.yz) * blending.x;
    clrw = vec4(pow(clrw.x, 0.5), pow(clrw.y, 0.5), pow(clrw.z, 0.5), pow(clrw.a, 0.5));

    vec3 lightDir = vec3(10., 0., 3.);

    float shoreT = pow(1.0 / (1.0 + abs(vPosition.z - waterLevel) / 3.5), 15.);

    vec3 tNormal = normalize(reflect(normalize(vNormalMatrix * (clrw.xyz * 2.0 - vec3(1.0, 1.0, 1.0))), vNormal) * vec3(-1.0, 1.0, 1.0));
    tNormal = mix(tNormal, vNormal, 0.5-extra.z*0.5);

    float l = max(dot(tNormal, lightDir), 0.0) * 0.5 + 0.5;
    gl_FragColor = vec4(clr.rgb*l*0.5, clr.a);

    float _reflect = vreflect * (1. - shoreT) + 0.75 * shoreT;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, clamp((waterClr.rgb+vec3(.1,.1,.1)) * 6.0, 0., 1.), shoreT);

    vec3 incident = normalize(vSPosition.xyz);
    vec3 reflected = reflect(incident, tNormal);
    vec2 envCoord = reflected.xy*0.5;
    envCoord.y *= viewport.y/viewport.x;
    envCoord += vec2(0.5, 0.5);
    vec3 envClr = mix(texture2D(envMap, envCoord).rgb, texture2D(envMap2, envCoord).rgb, envMapT) * envCoord.x;
    envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(_reflect + envMapParam.x*0.25, 0., 0.7));

    highp float Z = vShadowCoord.z - 0.0005;
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

    if (vPosition.z > 0.0) {
        gl_FragColor.rgb /= (vPosition.z*15.0 + 1.0);
    }
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb, pow(vSPosition.z/200., 0.5)*pow(envMapTint.a, 3.0));
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1., 0., 0.), pow(1.0 / (1.0 + abs(vPosition.z - 0.0) / 5.0), 10.5));
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
}