varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform vec4 light;
uniform vec4 planet;
uniform sampler2D tex;

// http://fhtr.blogspot.ca/2013/12/opus-2-glsl-ray-tracing-tutorial.html
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

    float dist = length(vLocal.xy*1.5);
    float alpha = 1.0;

    float t = (dist - 0.75) / (0.95 - 0.75);
    vec4 clr = texture2D(tex, vec2(0., t));
    alpha = clr.a;

    if (dist > 0.95) {
        alpha *= 1.0 - (min(dist, 0.97) - 0.95) / 0.02;
    }
    else if (dist < 0.75) {
        alpha *= 1.0 - (0.75 - max(dist, 0.73)) / 0.02;
    }

    vec3 lightDir = light.xyz - vPosition.xyz;

    float l = 0.5 / (0.85 + abs(dot(lightDir/4.5, lightDir/4.5))/1500.0) + 0.5;
    l *= abs(dot(normalize(lightDir), normalize(vNormal))) * 0.5 + 0.5;
    if (rayIntersectsSphere(vPosition.xyz, normalize(lightDir), planet.xyz, planet.w) > -0.5) {
        l *= 0.25;
    }
    gl_FragColor = vec4(clr.rgb*l, alpha);

    if (alpha < 0.1) {
        discard;
    }
}