varying vec2 vUv;
varying vec4 clri, clrm, clro;
varying vec4 vExtra;

float rand(vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {

    vec2 P = (vUv - vec2(.5, .5)) * 6.;

    P.y /= vExtra.w;

    float str = pow(1. - clamp(P.x, 0., 1.), 2.5);
    str *= pow(1. - clamp(abs(P.y), 0., 1.), 1.5);

    if (P.x < 0.0) {
        str = 0.0;
    }
    else {
        str *= pow(P.x, 0.95);
    }

    str = clamp(str * 9.0, 0., 1.) * vExtra.x;
    str *= rand(vec2(str, vExtra.y)) * 0.25 + 0.875;
    str = clamp(str, 0., 1.);

    vec4 clr = clro;
    if (str > 0.6) {
        float t = (str - 0.6) / 0.4;
        clr = mix(clrm, clri, t);
    }
    else if (str > 0.3) {
        float t = (str - 0.3) / (0.6 - 0.3);
        clr = mix(clro, clrm, t);
    }

    gl_FragColor = vec4(clr.rgb, str);

}