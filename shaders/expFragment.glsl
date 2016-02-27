varying vec2 vUv;

uniform sampler2D img;
uniform vec4 pal1;
uniform vec4 pal2;
uniform vec4 pal3;
uniform vec4 pal4;
uniform vec2 frame;

void main() {

    float amp = texture2D(
        img,
        vUv/8.0 + frame
    ).r;
    vec3 clr = vec3(0., 0., 0.);

    if (amp < pal1.a) {
        clr = mix(clr, pal1.rgb, amp / pal1.a);
    }
    else if (amp < pal2.a) {
        clr = mix(pal1.rgb, pal2.rgb, (amp-pal1.a) / (pal2.a - pal1.a));
    }
    else if (amp < pal3.a) {
        clr = mix(pal2.rgb, pal3.rgb, (amp-pal2.a) / (pal3.a - pal2.a));
    }
    else {
        amp = min(amp, 1.0);
        clr = mix(pal3.rgb, pal4.rgb, (amp-pal3.a) / (1.0 - pal3.a));
    }

    gl_FragColor = vec4(clr.rgb, amp);

}