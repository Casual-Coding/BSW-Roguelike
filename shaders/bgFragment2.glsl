varying vec2 vUv;

uniform vec3 cam;
uniform vec2 vp; 
uniform sampler2D tDust;

#define SAMPLE_POS(I, SUB) (mod(SUB, 1.0)*0.25 + vec2(floor(mod(I, 4.0)) * 0.25, floor((I) / 4.0) * 0.25))
#define SAMPLE_POS2(I, SUB) (clamp(SUB, 0.0, 1.0)*0.25 + vec2(floor(mod(I, 4.0)) * 0.25, floor((I) / 4.0) * 0.25))
#define TO_WORLD(P, Z) ((P) / (vec2(vp.y/vp.x, 1.0)*Z) + cam.xy)

float rand (vec2 co) {
    return fract(sin(dot(co.xy+vec2(100.0, 100.0), vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 rotVec (vec2 p, vec2 c, float a) {
    float ca = cos(a), sa = sin(a);
    p -= c;
    return vec2(
        p.x * ca - p.y * sa + c.x,
        p.y * ca + p.x * sa + c.y
    );
}

vec4 sampleDust (vec2 p) {

    #define DUST_SIZE 64.0

    vec2 p2 = TO_WORLD(p, cam.z) / DUST_SIZE;
    float i = floor(rand(floor(p2)) * 15.0);

    return texture2D(tDust, SAMPLE_POS(i, p2));

}

void main() {

    vec2 p = vUv - vec2(0.5, 0.5);

    gl_FragColor = sampleDust(p);

}