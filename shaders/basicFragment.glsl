varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform sampler2D map;
uniform sampler2D dmgMap;
uniform vec4 light;
uniform vec4 clr;
uniform vec4 extra;
uniform float warpIn;

void main() {

    float scale = 0.5 * extra.x;
    float dmg = extra.w;

    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);

    vec4 clrn = texture2D(map, vLocal.xy * scale + vec2(0.5, 0.5));
    vec4 clrdn = texture2D(dmgMap, vLocal.xy * 0.1 + vec2(0.5, 0.5));
    vec3 tNormal = vNormalMatrix * (normalize(clrn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0));
    vec3 tNormald = vNormalMatrix * (normalize(clrdn.xyz) * 2.0 - vec3(1.0, 1.0, 1.0));
    vec3 lightDir = normalize(light.xyz - vPosition.xyz);

    float l0 = (clrn.a + clrdn.a*dmg)/(1.0+dmg) * 0.25 + 0.75;
    float l1 = pow(max(dot(normalize(tNormal), lightDir), 0.0), 0.7);
    float l1d = pow(max(dot(normalize(tNormald), lightDir), 0.0), 0.7);
    float l2 = (pow(max(dot(normalize(vNormal), lightDir), 0.0), 3.0) + pow(topFactor, 2.5)) * 0.5;
    float l = min(l0 * ((l1*0.8-l1d*0.6*dmg+0.6) * l2) * 1.0, 1.0) / max(length(vSPosition.xy)*0.015 + 0.2, 0.75);
    l = pow(l, 1.5) + 0.2;

    if (extra.y <= 0.0) {
        gl_FragColor = vec4(clr.rgb*l, 1.0);
    }
    else {
        float al = (sin(vLocal.x * vLocal.y * 30.0 + extra.z*6.0) * 0.5 + 0.5) * extra.y * 0.5;
        gl_FragColor = vec4(clr.rgb*vec3(al*1.0+(1.0-al), al*0.5+(1.0-al), 0.25*al+(1.0-al))*l, 1.0);
    }

    if (warpIn > 0.9) {
        gl_FragColor = vec4(1., 1., 1., 1.0 - (warpIn - 0.9) / 0.1);
    }
    else {
        gl_FragColor = mix(gl_FragColor, vec4(1.,1.,1.,1.), (warpIn - 0.1) / 0.9);
    }

}