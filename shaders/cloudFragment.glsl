varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform vec4 clr;

uniform sampler2D shadowMap, texture;
varying vec4 vShadowCoord;

uniform vec4 envMapTint;
uniform vec4 envMapParam;

void main() {

    gl_FragColor.a = clr.a * texture2D(texture, vLocal.xy/4. + vec2(.1,.25)).a;
    gl_FragColor.rgb = mix(clr.rgb * texture2D(texture, vLocal.xy/2.).a, envMapTint.rgb, 0.25);

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
        gl_FragColor.rgb *= (1.0 - svec.a) * 0.5 + 0.5;
    }
    else {
        gl_FragColor.rgb *= (1.0 - svec.a / ((Z-zval)*50.+1.0)) * 0.5 + 0.5;
    }
    gl_FragColor.rgb -= 0.1;
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);

    if (vPosition.z > 0.0) {
        gl_FragColor.rgb /= (vPosition.z*15.0 + 1.0);
    }
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb, pow(vSPosition.z/200., 0.5)*envMapTint.a);
}