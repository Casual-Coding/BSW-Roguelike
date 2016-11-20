varying vec2 vUv;
uniform sampler2D texture;

void main() {
    vec4 clrw = texture2D(texture, vUv);
    if (pow(max(clrw.a, 0.), 0.25) < .15) {
        discard;
    }
}