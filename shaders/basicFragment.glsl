varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
uniform vec4 light;
uniform vec4 clr;

void main() {

    vec3 lightDir = light.xyz - vPosition.xyz;
    float l = min(max(dot(vNormal, normalize(lightDir)), 0.0) / (0.005*length(lightDir)+1.0), 1.0);
    gl_FragColor = vec4(clr.r*l, clr.g*l, clr.b*l, 1.0);

}