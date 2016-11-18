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
varying float vShadowZ;
varying vec4 vShadowCoord;
uniform sampler2D envMap, envMap2;
uniform float envMapT;
uniform vec4 envMapTint;
uniform vec4 envMapParam;

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
    vec3 envClr = mix(texture2D(envMap, envCoord).rgb, texture2D(envMap2, envCoord).rgb, envMapT);
    envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(0.75 + envMapParam.x, 0., 1.));

    vec2 svp = vShadowCoord.xy + vec2(1./512., 0.);
    vec4 svec = vec4(0., 0., 0., 1.);
    float Z = vShadowZ;
    float zval = Z-0.05;
    if (svp.x > 0. && svp.y > 0. && svp.x < 1. && svp.y < 1.) {
        vec4 SA = texture2D(shadowMap, svp);
        vec4 SB = texture2D(shadowMap, svp - vec2(1./16384., 0.)); 
        vec4 SC = texture2D(shadowMap, svp + vec2(1./16384., 0.));
        vec4 SD = texture2D(shadowMap, svp - vec2(0., 1./16384.));
        vec4 SE = texture2D(shadowMap, svp + vec2(0., 1./16384.));
        float ZA = (SA.r * 4096.0 + SA.g * 64.0 + SA.b) / 64.0;
        float ZB = (SB.r * 4096.0 + SB.g * 64.0 + SB.b) / 64.0;
        float ZC = (SC.r * 4096.0 + SC.g * 64.0 + SC.b) / 64.0;
        float ZD = (SD.r * 4096.0 + SD.g * 64.0 + SD.b) / 64.0;
        float ZE = (SE.r * 4096.0 + SE.g * 64.0 + SE.b) / 64.0;
        zval = (ZA+ZB+ZC+ZD+ZE) / 5.0;
        svec.a = (SA.a + SB.a + SC.a + SD.a + SE.a) / 5.0;
    }
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
    if (zval < Z) {
        gl_FragColor.rgb *= (1.0 - svec.a) * 0.75 + 0.25;
    }
    else {
        gl_FragColor.rgb *= (1.0 - svec.a / ((zval-Z)*5000.0+1.0)) * 0.75 + 0.25;
    }
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb*0.25, pow(vSPosition.z/200., 0.5)*envMapTint.a);
}