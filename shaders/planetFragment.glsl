varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec4 vSPosition;
varying vec3 vLocal;
varying mat3 vNormalMatrix;

uniform sampler2D map, mapW;
uniform vec4 light;

uniform vec4 clr1;
uniform vec4 clr2;
uniform vec4 clr3;
uniform vec4 clr4;

uniform vec4 extra;

#define WATER clr1
#define GRASS clr2
#define ROCK1 clr3
#define ROCK2 clr4

void main() {

    vec4 clr;
    float len = length(vLocal);
    float waterAmt = 0.0;
    if (len < 0.900) {
        clr = WATER;
        waterAmt = 1.0;
    }
    else if (len < 0.904) {
        waterAmt = 1.0 - (len-0.900) / 0.004;
        clr = mix(WATER, GRASS, (len-0.900) / 0.004);
    }
    else if (len < 0.925) {
        clr = GRASS;
    }
    else if (len < 0.930) {
        clr = mix(GRASS, ROCK1, (len-0.925) / 0.005);
    }
    else if (len < 0.950) {
        clr = ROCK1;
    }
    else if (len < 0.955) {
        clr = mix(ROCK1, ROCK2, (len-0.950) / 0.005);
    }
    else {
        clr = ROCK2;
    }

    if (extra.x > 0.5) {
        waterAmt *= 0.0;
    }

    float scale = 0.5 * 3.0;
    float scaleW = 0.5 * 7.0;
    
    vec3 blending = abs( vNormal );
    float topFactor = blending.z / (blending.x + blending.y + blending.z);
    blending = vNormal + vec3(1.0, 1.0, 1.0);
    blending = normalize(max(blending, 0.00001));
    float b = (blending.x + blending.y + blending.z);
    blending /= vec3(b, b, b);
    
    vec3 texCoord = vLocal * 0.5 + 0.5;
    vec4 clrn = texture2D(map, texCoord.xy * scale) * blending.z +
                texture2D(map, texCoord.xz * scale) * blending.y + 
                texture2D(map, texCoord.yz * scale) * blending.x; 

    texCoord = vLocal * 0.5 + vec3(0.5*extra.w/100.0, 1.0*extra.w/100.0, 1.0*extra.w/100.0) + 0.5;
    vec4 clrw = texture2D(mapW, texCoord.xy * scaleW) * blending.z +
                texture2D(mapW, texCoord.xz * scaleW) * blending.y + 
                texture2D(mapW, texCoord.yz * scaleW) * blending.x; 

    clrn = waterAmt * vec4(0.0, 0.0, 1.0*clrw.a, 1.0) + (1.0-waterAmt) * clrn;

    vec3 tNormal = normalize(clrn.xyz * 2.0 - vec3(1.0, 1.0, 1.0));  
    vec3 wNormal = normalize(clrw.xyz * 1.0 + vec3(0.25, 0.25, 0.25));
    vec3 lightDir = light.xyz - vPosition.xyz;

    float l0 = clrn.a * 0.25 + 0.75;
    float l1 = max(dot(normalize(vNormal+0.35*tNormal*dot(tNormal, vNormal)), normalize(lightDir)), 0.0);
    float l1w = max(dot(normalize(vNormal+0.35*wNormal*dot(wNormal, vNormal)), normalize(lightDir)), 0.0);
    l1 = waterAmt * l1w + (1.0 - waterAmt) * l1;
    float l = 5.0 * min(l1*l0, 1.0) / max(dot(lightDir/100.0, lightDir/100.0)*0.00001 + 0.1, 3.0) + 0.1;
    gl_FragColor = vec4(clr.rgb*l*clrn.a, 1.0);

}