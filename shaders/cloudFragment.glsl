varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;
varying float vShadowZ;

uniform vec4 clr;
uniform float tScale;

uniform sampler2D shadowMap, texture;
varying vec4 vShadowCoord;

uniform vec4 envMapTint;
uniform vec4 envMapParam;

void main() {

    gl_FragColor.a = clr.a * (0.25*texture2D(texture, vLocal.xy/1.5 + vec2(.1,.25)).a+0.75);
    gl_FragColor.rgb = mix(clr.rgb * (texture2D(texture, vLocal.xy/0.75).a*0.25+0.75), envMapTint.rgb, envMapTint.a);

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);
    vec3 lightDir = normalize(vec3(10., 0, 3.));
    float l2 = pow(max(dot(normalize(vNormal), lightDir), 0.0), 0.3) + min(pow(topFactor, 2.5), 1.0) * 0.5;

    vec2 svp = vShadowCoord.xy + vec2(1./512., 0.);
    vec4 svec = vec4(0., 0., 0., 1.);
    float Z = vShadowZ;
    float zval = Z-0.05;
    if (svp.x > 0. && svp.y > 0. && svp.x < 1. && svp.y < 1.) {
        vec4 SA = texture2D(shadowMap, svp);
        vec4 SB = texture2D(shadowMap, svp - vec2(1./2048., 0.)); 
        vec4 SC = texture2D(shadowMap, svp + vec2(1./2048., 0.));
        vec4 SD = texture2D(shadowMap, svp - vec2(0., 1./2048.));
        vec4 SE = texture2D(shadowMap, svp + vec2(0., 1./2048.));
        float ZA = (SA.r * 4096.0 + SA.g * 64.0 + SA.b) / 64.0;
        float ZB = (SB.r * 4096.0 + SB.g * 64.0 + SB.b) / 64.0;
        float ZC = (SC.r * 4096.0 + SC.g * 64.0 + SC.b) / 64.0;
        float ZD = (SD.r * 4096.0 + SD.g * 64.0 + SD.b) / 64.0;
        float ZE = (SE.r * 4096.0 + SE.g * 64.0 + SE.b) / 64.0;
        zval = (ZA+ZB+ZC+ZD+ZE) / 5.0;
        svec.a = (SA.a + SB.a + SC.a + SD.a + SE.a) / 5.0;
    }
    gl_FragColor.rgb -= 0.1;
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);

    if (zval < Z) {
        gl_FragColor.rgb *= (1.0 - svec.a) * 0.5 + 0.5;
    }
    else {
        gl_FragColor.rgb *= (1.0 - svec.a / ((zval-Z)*5000.0+1.0)) * 0.5 + 0.5;
    }

    if (vPosition.z > 0.0) {
        gl_FragColor.rgb /= (vPosition.z*15.0 + 1.0);
    }
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envMapTint.rgb, pow(vSPosition.z/200., 0.5)*envMapTint.a);

    gl_FragColor.rgb *= l2 * 0.75 + 0.25;
}