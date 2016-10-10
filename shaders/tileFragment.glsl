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
varying float vFragDepth;
varying vec4 vShadowCoord;

uniform vec4 envMapTint;
uniform vec4 envMapParam;

void main() {

    //vec3 fdx = vec3(dFdx(vPosition.x),dFdx(vPosition.y),dFdx(vPosition.z));
    //vec3 fdy = vec3(dFdy(vPosition.x),dFdy(vPosition.y),dFdy(vPosition.z));
    vec3 N = vNormal;//normalize(cross(fdx,fdy));

    vec3 blending = abs( N );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);
    blending = N + vec3(1.0, 1.0, 1.0);
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

    float shoreT = pow(1.0 / (1.0 + abs(vPosition.z - waterLevel) / 3.5), 15.);

    float l0 = clrn.a * 0.5 + 0.5 * pow(clrw.a, 2.0);
    float l1 = pow(max(dot(normalize((normalize(clrw.xyz) * 2.0 - vec3(1., 1., 1.))), lightDir), 0.0), 0.7) * extra.z;
    float l2 = (pow(max(dot(normalize(N), lightDir), 0.0), 3.0) + pow(topFactor, 2.5)) * 0.5;
    float l = min(l0 * ((l1*0.4+0.4) * l2) * 1.0, 1.0) / max(length(vSPosition.xy)*0.015 + 0.2, 0.75);
    l = pow(max(l, 0.0), 2.5) + 0.3;
    gl_FragColor = vec4(clr.rgb*l, 1.0);

    float _reflect = vreflect * (1. - shoreT) + 0.75 * shoreT;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, clamp((waterClr.rgb+vec3(.1,.1,.1)) * 6.0, 0., 1.), shoreT);

    vec3 incident = normalize(vSPosition.xyz);
    vec3 reflected = reflect(incident, N);
    vec2 envCoord = reflected.xy*0.5;
    envCoord.y *= viewport.y/viewport.x;
    envCoord += vec2(0.5, 0.5);
    vec3 envClr = mix(texture2D(envMap, envCoord).rgb, texture2D(envMap2, envCoord).rgb, envMapT);
    envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
    //gl_FragColor.rgb = clamp(gl_FragColor.rgb + gl_FragColor.rgb * envClr * vreflect * 4.0, 0., 1.);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(_reflect + envMapParam.x, 0., 1.));

    vec2 svp = vShadowCoord.xy + vec2(1./512., 0.);
    vec4 svec = vec4(0., 0., 0., 1.);
    float Z = vPosition.z / vPosition.w;
    float zval = Z-0.05;
    if (svp.x > 0. && svp.y > 0. && svp.x < 1. && svp.y < 1.) {
        vec4 SA = texture2D(shadowMap, svp);
        vec4 SB = texture2D(shadowMap, svp - vec2(1./16384., 0.)); 
        vec4 SC = texture2D(shadowMap, svp + vec2(1./16384., 0.));
        vec4 SD = texture2D(shadowMap, svp - vec2(0., 1./16384.));
        vec4 SE = texture2D(shadowMap, svp + vec2(0., 1./16384.));
        float ZA = (SA.r * 65536.0 + SA.g * 256.0 + SA.b) / 256.0 - 256.0;
        float ZB = (SB.r * 65536.0 + SB.g * 256.0 + SB.b) / 256.0 - 256.0;
        float ZC = (SC.r * 65536.0 + SC.g * 256.0 + SC.b) / 256.0 - 256.0;
        float ZD = (SD.r * 65536.0 + SD.g * 256.0 + SD.b) / 256.0 - 256.0;
        float ZE = (SE.r * 65536.0 + SE.g * 256.0 + SE.b) / 256.0 - 256.0;
        zval = (ZA+ZB+ZC+ZD+ZE) / 5.0;
        svec.a = (SA.a + SB.a + SC.a + SD.a + SE.a) / 5.0;
    }
    if (zval > Z) {
        gl_FragColor.rgb *= (1.0 - svec.a) * 0.65 + 0.35;
    }
    else {
        gl_FragColor.rgb *= (1.0 - svec.a / ((Z-zval)*25.+1.0)) * 0.65 + 0.35;
    }
    gl_FragColor.rgb -= 0.1;
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);

    if (vPosition.z > 0.0) {
        gl_FragColor.rgb /= (vPosition.z*15.0 + 1.0);
    }
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb, pow(vSPosition.z/200., 0.5)*envMapTint.a);

    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1., 0., 0.), pow(1.0 / (1.0 + abs(vPosition.z - 0.0) / 5.0), 10.5));
}