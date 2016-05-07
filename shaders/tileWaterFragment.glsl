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

    float depth = 1.0 - texture2D(shadowMap, (vPosition.xy - cam.xy) * cam.z / 1.5 + vec2(0.5, 0.5)).a;
    gl_FragColor.rgb *= depth * 0.5 + 0.5;

}