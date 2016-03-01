varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform vec4 light;
uniform vec4 planet;

uniform vec4 clr1;
uniform vec4 clr2;
uniform vec4 clr3;
uniform vec4 clr4;


float rayIntersectsSphere(vec3 ray, vec3 dir, vec3 center, float radius)
{
    vec3 rc = ray-center;
    float c = dot(rc, rc) - (radius*radius);
    float b = dot(dir, rc);
    float d = b*b - c;
    float t = -b - sqrt(abs(d));
    if (d < 0.0 || t < 0.0) {
        return -1.0;
    } else {
        return t;
    }
}

void main() {

    float dist = length(vLocal.xy);
    float alpha = 1.0;

    vec4 clr = clr1;

    if (dist > 0.95) {
        alpha *= 1.0 - (min(dist, 0.97) - 0.95) / 0.02;
    }
    else if (dist < 0.75) {
        alpha *= 1.0 - (0.75 - max(dist, 0.73)) / 0.02;
    }
    else {
        float t = (dist - 0.75) / (0.95 - 0.75);
        t *= 24.0;
        float tt = t - floor(t);
        float cn = mod(floor(t), 8.0);
        vec4 clra, clrb;
        if (cn < 0.1) {
            clra = clr1; clrb = vec4(0.,0.,0.,0.);
        }
        else if (cn < 1.1) {
            clra = vec4(0.,0.,0.,0.); clrb = clr2;
        }
        else if (cn < 2.1) {
            clra = clr2; clrb = vec4(0.,0.,0.,0.);
        }
        else if (cn < 3.1) {
            clra = vec4(0.,0.,0.,0.); clrb = clr3;
        }
        else if (cn < 4.1) {
            clra = clr3; clrb = vec4(0.,0.,0.,0.);
        }
        else if (cn < 5.1) {
            clra = vec4(0.,0.,0.,0.); clrb = clr4;
        }
        else if (cn < 6.1) {
            clra = clr4; clrb = vec4(0.,0.,0.,0.);
        }
        else if (cn < 7.1) {
            clra = vec4(0.,0.,0.,0.); clrb = clr1;
        }
        clr = clra * (1.0-tt) + clrb * tt;
    }

    clr = vec4(pow(clr.r, 2.0), pow(clr.g, 2.0), pow(clr.b, 2.0), 1.0);
    clr = 0.1 + clr * 0.9;

    vec3 lightDir = light.xyz - vPosition.xyz;

    float l = 1.0 / (0.001 + length(lightDir)/15.0) + 0.5;
    if (rayIntersectsSphere(vPosition.xyz, normalize(lightDir), planet.xyz, planet.w) > -0.5) {
        l *= 0.25;
    }
    gl_FragColor = vec4(clr.rgb*l, alpha*0.65);

    if (alpha < 0.5) {
        discard;
    }
}