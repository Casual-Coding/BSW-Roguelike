varying vec2 vUv;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;
uniform sampler2D tex4;
uniform sampler2D tex5;
uniform sampler2D tex6;
uniform sampler2D tex7;

varying vec4 pal1;
varying vec4 pal2;
varying vec4 pal3;
varying vec4 pal4;
varying vec3 frame;
varying float tex;

void main() {

    float amp;

    if (tex < 1.0) {
        amp = texture2D(
            tex0,
            vUv/8.0 + frame.xy
        ).r * frame.z;
    } else if (tex < 2.0) {
        amp = texture2D(
            tex1,
            vUv/8.0 + frame.xy
        ).r * frame.z;
    } else if (tex < 3.0) {
        amp = texture2D(
            tex2,
            vUv/8.0 + frame.xy
        ).r * frame.z;
    } else if (tex < 4.0) {
        amp = texture2D(
            tex3,
            vUv/8.0 + frame.xy
        ).r * frame.z;
    } else if (tex < 5.0) {
        amp = texture2D(
            tex4,
            vUv/8.0 + frame.xy
        ).r * frame.z;
    } else if (tex < 6.0) {
        amp = texture2D(
            tex5,
            vUv/8.0 + frame.xy
        ).r * frame.z;
    } else if (tex < 7.0) {
        amp = texture2D(
            tex6,
            vUv/8.0 + frame.xy
        ).r * frame.z;
    } else {
        amp = texture2D(
            tex7,
            vUv/8.0 + frame.xy
        ).r * frame.z;
    }

    amp = pow(amp, 1.0-amp*0.9+0.5);
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

    gl_FragColor = vec4(clr.rgb*0.75, amp);

}