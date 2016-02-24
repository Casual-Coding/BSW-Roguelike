uniform vec4 extra;
uniform vec4 clr;
uniform vec4 light;
uniform sampler2D map;
varying mat3 vNormalMatrix;
varying vec3 vLocal;
varying vec4 vSPosition;
varying vec4 vPosition;
varying vec3 vNormal;

void main ()
{
  vec3 tmpvar_1;
  tmpvar_1 = abs(vNormal);
  vec4 tmpvar_2;
  tmpvar_2 = texture2D (map, ((vLocal.xy * (0.5 * extra.x)) + vec2(0.5, 0.5)));
  vec3 tmpvar_3;
  tmpvar_3 = normalize((light.xyz - vPosition.xyz));
  vec4 tmpvar_4;
  tmpvar_4.w = 1.0;
  tmpvar_4.xyz = (clr.xyz * (min ((((tmpvar_2.w * 0.25) + 0.75) * (((pow (max (dot (normalize((vNormalMatrix * ((tmpvar_2.xyz * 2.0) - vec3(1.0, 1.0, 1.0)))), tmpvar_3), 0.0), 0.7) * 0.8) + 0.6) * ((pow (max (dot (normalize(vNormal), tmpvar_3), 0.0), 3.0) + pow ((tmpvar_1.z / ((tmpvar_1.x + tmpvar_1.y) + tmpvar_1.z)), 2.5)) * 0.5))), 1.0) / max (((sqrt(dot (vSPosition.xy, vSPosition.xy)) * 0.05) + 0.2), 0.75)));
  gl_FragColor = tmpvar_4;
}