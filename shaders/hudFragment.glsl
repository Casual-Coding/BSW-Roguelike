varying vec2 vUv;

uniform vec2 vp;
uniform sampler2D hudNm;
uniform sampler2D texNm;
uniform vec4 clr;
uniform vec4 extra;

void main() {

    vec2 p = vUv;

    vec4 nm = vec4(0., 0., 0., 0.);
    float aspect = vp.x / vp.y;

    if (p.y < 0.5 || extra.x < 0.5) {
        if (aspect >= 1.0) {
            nm = texture2D(hudNm, vec2(p.x, p.y/aspect));
        }
        else {
            nm = texture2D(hudNm, vec2(p.x*aspect, p.y));
        }
    }
    else {
        nm = texture2D(hudNm, vec2(p.x, p.y/aspect - (1.0/aspect - 1.0)));
    }

    if (extra.y > 0.5) {
        float olda = nm.a;
        nm = vec4(1.-nm.r, 1.-nm.g, 1.-nm.b, 1.-nm.a);
        nm.a *= olda;
    }

    vec4 nm2;

    if (extra.z < 0.5) {
        nm2 = texture2D(texNm, gl_FragCoord.xy/1024.0);
    }
    else {
        nm2 = texture2D(texNm, vec2(p.x, p.y/aspect)/2.5+vec2(0.5, 0.5));
    }

    vec3 tNormal = normalize(nm.xyz) * 2.0 - vec3(1.0, 1.0, 1.0);
    vec3 tNormal2 = normalize(nm2.xyz) * 2.0 - vec3(1.0, 1.0, 1.0);
    tNormal.z = -tNormal.z;
    tNormal2.z = -tNormal2.z;
    tNormal = normalize(tNormal + tNormal2 * 0.5);
    vec3 lightDir = normalize(vec3(1.2, 0.5, 0.0) - vec3(p.x, p.y, nm.a));

    float l0 = (nm.a * 0.75 + nm2.a * 0.25) * 0.25 + 0.75;
    float l1 = pow(max(dot(normalize(tNormal), lightDir), 0.0), 0.7);
    float l = min(l0 * (l1*0.8+0.6) * 1.0, 1.0) + 0.2;
    l = (pow(max(l, 0.0), 1.5) + 0.2) * nm.a * 0.5;

    nm2.a = pow(max(nm2.a, 0.0), 6.0);

    gl_FragColor = vec4(l+nm2.a * l * 0.1, l-nm2.a * l * 0.31, l-nm2.a * l * 0.4, min(nm.a*16.0, 1.0));
    gl_FragColor *= clr;

}