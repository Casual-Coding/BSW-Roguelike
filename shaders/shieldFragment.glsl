uniform vec4 clr;
uniform vec4 extra;

varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying float vFragDepth;

uniform vec2 viewport;
uniform sampler2D envMap, envMap2;
uniform float envMapT;
uniform vec4 envMapTint;
uniform vec4 envMapParam;

void main() {

    gl_FragColor = clamp(clr, 0., 1.);
    gl_FragColor.a *= pow(clamp(1.0 - abs(vPosition.z*0.25*(1.0/extra.x)), 0., 0.9), 1.0);

    vec3 incident = normalize(vSPosition.xyz);
    vec3 reflected = reflect(incident, vec3(vNormal.x, vNormal.y, max(0.1, abs(vNormal.z))));
    vec2 envCoord = reflected.xy*0.5;
    envCoord.y *= viewport.y/viewport.x;
    envCoord += vec2(0.5, 0.5);
    vec3 envClr = mix(texture2D(envMap, envCoord).rgb, texture2D(envMap2, envCoord).rgb, envMapT);
    envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(0.75 + envMapParam.x, 0., 1.));

}