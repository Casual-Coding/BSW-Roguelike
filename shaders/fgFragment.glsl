varying vec2 vUv;

uniform vec3 cam;
uniform vec2 vp; 
uniform vec4 mapInfo;
uniform sampler2D tPerlin, tMap, tNebula;

#define TO_WORLD(P, Z) ((P) / (vec2(vp.y/vp.x, 1.0)*Z) + cam.xy)

float rand (vec2 co) {
    return abs(fract(sin(dot(co.xy+vec2(100.0, 100.0), vec2(12.9898, 78.233))) * 43758.5453));
}

vec2 rotVec (vec2 p, vec2 c, float a) {
    float ca = cos(a), sa = sin(a);
    p -= c;
    return vec2(
        p.x * ca - p.y * sa + c.x,
        p.y * ca + p.x * sa + c.y
    );
}

vec4 sampleNebulas (vec2 p) {

    float z = cam.z;
    vec2 p0 = TO_WORLD(p, z);


    vec2 pmap = clamp(p0 / (mapInfo.x * mapInfo.y), 0.0, 1.0);
    vec4 tmp = texture2D(tMap, vec2(pmap.x, 1.0-pmap.y));
    float a = (texture2D(tPerlin, p0/100.0+vec2(1.0, 0.1)*0.01).a + mapInfo.w*0.1)*0.5+0.5;
    vec4 clr = texture2D(tNebula, p0/200.0+vec2(cos(a*3.14159), sin(a*3.14159))*0.1) * tmp.r;
    clr.a = pow(clr.a, 3.0);

    return clr;
}

void main() {

    vec2 p = vUv - vec2(0.5, 0.5);

    vec4 clr = sampleNebulas(p);
    gl_FragColor = clamp(vec4(pow(clr.r, 3.0), pow(clr.r, 3.0), clr.r, clr.a), 0.0, 1.0);

}