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

    float scale = 0.5 * extra.x;

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);

    vec4 clrn = texture2D(map, vLocal.xy * scale + vec2(0.5, 0.5));
    if (blending.z < 0.01) {
        clrn = texture2D(map, vLocal.yz * scale + vec2(0.5, 0.5));
    }
    vec3 tNormal = vNormalMatrix * (clrn.xyz * 2.0 - vec3(1.0, 1.0, 1.0));
    vec3 lightDir = normalize(light.xyz - vPosition.xyz);

    float l0 = clrn.a * 0.25 + 0.75;
    float l1 = pow(max(dot(normalize(tNormal), lightDir), 0.0), 0.7);
    float l2 = (pow(max(dot(normalize(vNormal), lightDir), 0.0), 3.0) + pow(topFactor, 2.5)) * 0.5;
    float l = min(l0 * ((l1*0.8+0.6) * l2) * 1.0, 1.0) / max(length(vSPosition.xy)*0.05 + 0.2, 0.75);
    l = pow(max(l, 0.0), 0.5) + 0.06;
    gl_FragColor = vec4(clr.rgb*l, clr.a);

}