attribute vec4 extra;
attribute float clr;

varying vec4 vExtra;
varying vec2 vUv;
varying vec4 clri, clrm, clro;

void main() {

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    vUv = uv;
    vExtra = extra;
    if (abs(clr-1.0) < 0.1) {
        clri = vec4(1., 1., 1., 1.);
        clrm = vec4(1., 1., 0., 1.);
        clro = vec4(1., 0., 0., 1.);
    }
    else if (abs(clr-2.0) < 0.1) {
        clri = vec4(1.,  1., 1., 1.);
        clrm = vec4(0., .5,  1., 1.);
        clro = vec4(0., 0., 1., 1.);
    }
    else if (abs(clr-3.0) < 0.1) {
        clri = vec4(1., 1., 1., 1.);
        clrm = vec4(.5, .5, .5, 1.);
        clro = vec4(.1, .1, .1, 1.);
    }
}