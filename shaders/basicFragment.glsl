varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform sampler2D map;
uniform vec4 light;
uniform vec4 clr;

void main() {

    vec3 blending = abs( vNormal );
    blending = normalize(max(blending, 0.00001));
    float b = (blending.x + blending.y + blending.z);
    blending /= vec3(b, b, b);

    float scale = 0.25;

    vec4 xaxis = texture2D( map, vLocal.yz * scale);
    vec4 yaxis = texture2D( map, vLocal.xz * scale);
    vec4 zaxis = texture2D( map, vLocal.xy * scale);
    vec3 tNormal = vNormalMatrix * ((xaxis * blending.x + yaxis * blending.y + zaxis * blending.z).xyz*2.0 - 1.0);

    vec3 lightDir = light.xyz - vPosition.xyz;
    float l = min(max(dot(normalize(tNormal), normalize(lightDir)), 0.0) / (0.00005*length(lightDir)+1.0), 1.0);
    float l2 = pow(min(max(dot(normalize(vNormal), normalize(lightDir)), 0.0) / (0.00005*length(lightDir)+1.0), 1.0), 4.0);
    l = ((l*0.8+0.2) * l2) * 0.8 + 0.2;
    gl_FragColor = vec4(clr.r*l, clr.g*l, clr.b*l, 1.0);

}