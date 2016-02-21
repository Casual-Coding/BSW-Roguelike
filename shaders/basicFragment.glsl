varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform sampler2D map;
uniform vec4 light;
uniform vec4 clr;
uniform vec4 extra;

void main() {

    vec3 blending = abs( vNormal );
    blending = normalize(max(blending, 0.00001));
    float b = (blending.x + blending.y + blending.z);
    blending /= vec3(b, b, b);

    float scale = 0.5 * extra.x;

    vec4 xaxis = texture2D( map, vLocal.yz * scale + vec2(0.5, 0.5));
    vec4 yaxis = texture2D( map, vLocal.xz * scale + vec2(0.5, 0.5));
    vec4 zaxis = texture2D( map, vLocal.xy * scale + vec2(0.5, 0.5));
    vec4 clrn = (xaxis * blending.x + yaxis * blending.y + zaxis * blending.z)*2.0 - 1.0;
    vec3 tNormal = vNormalMatrix * clrn.xyz;
    float l0 = clrn.a * 0.25 + 0.75;

    vec3 lightDir = normalize(light.xyz - vPosition.xyz);
    float l = pow(max(dot(normalize(tNormal), lightDir), 0.0), 0.7);
    float l2 = (pow(max(dot(normalize(vNormal), lightDir), 0.0), 3.0) + pow(blending.z, 2.5)) * 0.5;
    l = min(l0 * ((l*0.8+0.6) * l2) * 1.0, 1.0) / max(length(vSPosition.xy)*0.05 + 0.2, 0.75);
    gl_FragColor = vec4(clr.r*l, clr.g*l, clr.b*l, 1.0);

}