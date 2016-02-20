varying vec2 vUv;
uniform sampler2D img;
uniform vec4 clr;

void main() {

    gl_FragColor = texture2D(img, vUv) * clr;

}