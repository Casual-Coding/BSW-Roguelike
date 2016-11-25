varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform sampler2D map;
uniform sampler2D envMap, envMap2;
uniform float envMapT;
uniform vec4 clr;
uniform vec4 extra;
uniform vec2 viewport;
uniform vec4 envMapTint;
uniform vec4 envMapParam;

void main() {

    float scale = 0.5 * extra.x;

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);

    vec4 clrn = texture2D(map, vLocal.xy * scale + vec2(0.5, 0.5));
    if (blending.z < 0.01) {
        clrn = texture2D(map, vLocal.yz * scale + vec2(0.5, 0.5));
    }
    vec3 tNormal = reflect(normalize(vNormalMatrix * (normalize(clrn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0))), normalize(vNormal)) * vec3(-1.0, 1.0, 1.0);
    vec3 lightDir = normalize(vec3(10., 0, 3.));

    tNormal = mix(tNormal, vNormal, 0.7);

    float l0 = clrn.a * 0.35 + 0.65;
    float l1 = pow(max(dot(normalize(tNormal), lightDir), 0.0), 0.5);
    float l2 = clamp(pow(max(dot(normalize(vNormal), lightDir), 0.0), 0.3) + min(pow(topFactor, 2.5), 1.0) * 1.0, 0., 1.);
    float l = min(l0 * (l1*0.8+0.6) * l2, 1.0) / max(length(vSPosition.xy)*0.015 + 0.2, 1.0);
    l = pow(max(l, 0.0), 2.0);
    gl_FragColor = clamp(vec4(clr.rgb*l, clr.a), 0., 1.);

    vec3 envNormal = tNormal;
    vec3 incident = vec3(vSPosition.xy, 0.0);
    vec3 reflected = reflect(incident, envNormal);
    vec2 envCoord = reflected.xy*0.5;
    envCoord.y *= viewport.y/viewport.x;
    envCoord += vec2(0.5, 0.5);
    vec3 envClr = mix(texture2D(envMap, envCoord).rgb*envCoord.x, texture2D(envMap2, envCoord).rgb*envCoord.x, envMapT);
    envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(envMapParam.x, 0., 0.8)) * 0.8;

}