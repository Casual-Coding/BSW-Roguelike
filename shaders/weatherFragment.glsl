varying vec2 vUv;
uniform vec4 color;
uniform float density;
uniform float size;
varying vec4 vAttr1;
varying vec4 vPosition;
varying vec4 vSPosition;
uniform sampler2D envMap;
uniform vec4 envMapTint, envMapParam;

void main() {

    if ((vAttr1.x+0.0001) > density || length(vUv) > 0.5) {
        discard;
    }
    else {
        gl_FragColor = color;
        gl_FragColor.rgb = mix(color.rgb, vec3(1., 1., 1.), 0.5/(1.+15.*length(vUv+vec2(-size*0.7, size*0.1))));
        gl_FragColor.a *= 1./(1.+2.*length(vUv));

        vec3 envNormal = normalize(vec3(vUv, 1.5));
        vec3 incident = normalize(vSPosition.xyz);
        vec3 reflected = reflect(incident, envNormal);
        vec2 envCoord = reflected.xy*0.5;
        envCoord.y *= 1. / 1.5;
        envCoord += vec2(0.5, 0.5);
        vec3 envClr = texture2D(envMap, envCoord).rgb;
        envClr = mix(envClr, envMapTint.rgb, envMapTint.a);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, envClr, clamp(0.5 + envMapParam.x, 0., 1.));
    }
}