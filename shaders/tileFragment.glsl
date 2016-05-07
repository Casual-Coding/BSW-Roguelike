varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform sampler2D map, exMap;
uniform vec4 light, clr, extra;

uniform sampler2D shadowMap;
uniform vec2 viewport;
uniform vec3 cam;
varying float vFragDepth;

void main() {

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);
    blending = vNormal + vec3(1.0, 1.0, 1.0);
    blending = normalize(max(blending, 0.00001));
    float b = (blending.x + blending.y + blending.z);
    blending /= vec3(b, b, b);

    vec3 texCoord = vPosition.xyz / 32.0;
    vec4 clrw = texture2D(exMap, texCoord.xy) * blending.z * 2.0 +
                texture2D(exMap, texCoord.xz) * blending.y * 0.5 + 
                texture2D(exMap, texCoord.yz) * blending.x * 0.5;
    clrw = vec4(pow(clrw.r, 2.0), pow(clrw.g, 2.0), pow(clrw.b, 2.0), pow(clrw.a, 2.0));

    vec4 clrn = texture2D(map, vUv);
    vec3 tNormal = vNormalMatrix * (normalize(clrn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0));
    vec3 lightDir = normalize(light.xyz - vPosition.xyz);

    clrn.w = clrn.w * 0.5 + 0.5;

    float l0 = clrn.a * 0.125 + 0.5 * clrw.a + 0.5;
    float l1 = pow(max(dot(normalize(tNormal*(normalize(clrw.xyz) * 2.0 - vec3(1., 1., 1.))), lightDir), 0.0), 0.7);
    float l2 = (pow(max(dot(normalize(vNormal), lightDir), 0.0), 3.0) + pow(topFactor, 2.5)) * 0.5;
    float l = min(l0 * ((l1*0.4+0.4) * l2) * 1.0, 1.0) / max(length(vSPosition.xy)*0.015 + 0.2, 0.75);
    l = pow(l, 1.5) + 0.2;

    gl_FragColor = vec4(clr.rgb*l, 1.0);

    float depth = 1.0 - texture2D(shadowMap, (vPosition.xy - cam.xy) * cam.z / 3.0 * 2.0 + vec2(0.5, 0.5)).a;
    gl_FragColor.rgb *= depth * 0.5 + 0.5;

}