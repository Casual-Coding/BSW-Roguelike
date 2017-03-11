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
        nm2 = texture2D(texNm, gl_FragCoord.xy*vec2(-1.,1.)/218.0);
    }
    else {
        nm2 = texture2D(texNm, vec2(p.x, p.y/aspect)*vec2(-1.,1.)*4.0+vec2(0.5, 0.5));
    }

    vec4 lightNm = texture2D(texNm, gl_FragCoord.xy/1024.0+vec2(extra.w/1024., extra.w/1024.));

    vec3 tNormal = normalize(nm.xyz) * 2.0 - vec3(1.0, 1.0, 1.0);
    vec3 tNormal2 = normalize(nm2.xyz) * 2.0 - vec3(1.0, 1.0, 1.0);
    vec2 V = vec2(pow(sin(gl_FragCoord.x/32.+extra.w/8.+lightNm.x*lightNm.y),2.0), pow(sin(gl_FragCoord.y/32.+extra.w/8.+lightNm.y*lightNm.z),2.0));
    float Vt = V.x * V.y * 0.5 + 0.5;
    tNormal = reflect(normalize(tNormal2*Vt+tNormal*(1.-Vt)), normalize(tNormal));
    vec3 lightDir = normalize(vec3(1.2+V.x, 0.5+V.y, 0.0) - vec3(p.x, p.y, nm.a));

    float l0 = (nm.a * 0.5 + nm2.a * 0.4) * 0.5 + 0.2;
    float l1 = pow(max(dot(normalize(tNormal), lightDir), 0.0), 1.7);
    float l = min(l0 * (l1*0.8+0.6) * 1.0, 1.0) + 0.2;
    l = (pow(max(l, 0.0), 1.5) + 0.2) * nm.a * 0.5;

    nm2.a = pow(max(nm2.a, 0.0), 6.0);

    gl_FragColor = vec4(l, l, l, min(nm.a*16.0, 1.0));
    gl_FragColor = clamp((clr+vec4(1.,1.,1.,1.)) * Vt * gl_FragColor, 0., 1.);

}