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
varying float vFragDepth;
varying vec4 vShadowCoord;

void main() {

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);
    blending = vNormal + vec3(1.0, 1.0, 1.0);
    blending = normalize(max(blending, 0.00001));
    float b = (blending.x + blending.y + blending.z);
    blending /= vec3(b, b, b);

    vec3 texCoord = vPosition.xyz / 32.0 + vec3(0.5*extra.x/50.0, 1.0*extra.x/50.0, 1.0*extra.x/50.0) + 0.5;
    vec4 clrw = texture2D(exMap, texCoord.xy * extra.y);

    vec3 wNormal = normalize(clrw.xyz);
    vec3 lightDir = light.xyz - vPosition.xyz;

    float l1w = max(dot(normalize(vNormal+0.75*wNormal*dot(wNormal, vNormal)), normalize(lightDir)), 0.0);

    gl_FragColor.rgb = clr.rgb * (0.1 + 5.0*l1w) * 0.5;
    gl_FragColor.a = clr.a;

    vec2 svp = vShadowCoord.xy + vec2(1./512., 0.);
    vec4 svec = vec4(0., 0., 0., 1.);
    float Z = vPosition.z / vPosition.w;
    float zval = Z-0.01;
    if (svp.x > 0. && svp.y > 0. && svp.x < 1. && svp.y < 1.) {
        svec = (texture2D(shadowMap, svp) * 0.75
             + texture2D(shadowMap, svp - vec2(1./2048., 0.)) * 0.0625 
             + texture2D(shadowMap, svp + vec2(1./2048., 0.)) * 0.0625
             + texture2D(shadowMap, svp - vec2(0., 1./2048.)) * 0.0625
             + texture2D(shadowMap, svp + vec2(0., 1./2048.)) * 0.0625);
        zval = (svec.r * 65536.0 + svec.g * 256.0 + svec.b) / 256.0 - 256.0;
    }
    if (zval > (Z-0.01)) {
        gl_FragColor.rgb *= (1.0 - svec.a) * 0.75 + 0.25;
    }
    else {
        gl_FragColor.rgb *= (1.0 - svec.a / (((Z-0.01)-zval)*7.5+1.0)) * 0.75 + 0.25;
    }
    gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);

}