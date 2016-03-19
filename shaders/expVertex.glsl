varying vec2 vUv;
uniform float damping;
uniform float time;
uniform vec4 pal0_0, pal0_1, pal0_2, pal0_3;
uniform vec4 pal1_0, pal1_1, pal1_2, pal1_3;
uniform vec4 pal2_0, pal2_1, pal2_2, pal2_3;
uniform vec4 pal3_0, pal3_1, pal3_2, pal3_3;
uniform vec4 pal4_0, pal4_1, pal4_2, pal4_3;
attribute vec4 attr1;
attribute vec4 attr2;
attribute vec3 attr3;
varying vec3 frame;
varying float tex;
varying vec4 pal1;
varying vec4 pal2;
varying vec4 pal3;
varying vec4 pal4;

void main() {
    
    float T = (time - attr1.w) / attr2.z;
    if (T > 0.0 && T < 1.0) {       
        // Position
        float t = (pow(damping, max(time - attr1.w, 0.0)) - 1.0) / log(damping);
        float ca = cos(attr2.w), sa = sin(attr2.w);
        float tsc = min((1.0-T)*2.0, 1.0);
        vec3 pos2 = position + vec3((attr3.x * ca - attr3.y * sa) * tsc, (attr3.y * ca + attr3.x * sa) * tsc, -2.0/attr3.z) * attr3.z
                             + t * attr1.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos2, 1.0 );

        // Animation frame
        float cframe = floor(pow(T, 1.0/attr2.y) * 45.0);
        frame = vec3(mod(cframe, 8.0)/8.0, 1.0 - floor(cframe/8.0)/8.0, 1.0-pow(T, 3.0));
        tex = floor(attr2.x / 10.0) + 0.5;
        
        // UV
        vUv = clamp(attr3.xy * 0.5 + 0.5, 0.0, 1.0);
        
        // Palette
        float pal = mod(attr2.x, 10.0) + 0.5;
        if (pal < 1.0) {
            pal1 = pal0_0, pal2 = pal0_1, pal3 = pal0_2, pal4 = pal0_3;
        }
        else if (pal < 2.0) {
            pal1 = pal1_0, pal2 = pal1_1, pal3 = pal1_2, pal4 = pal1_3;
        }
        else if (pal < 3.0) {
            pal1 = pal2_0, pal2 = pal2_1, pal3 = pal2_2, pal4 = pal2_3;
        }
        else if (pal < 4.0) {
            pal1 = pal3_0, pal2 = pal3_1, pal3 = pal3_2, pal4 = pal3_3;
        }
        else if (pal < 5.0) {
            pal1 = pal4_0, pal2 = pal4_1, pal3 = pal4_2, pal4 = pal4_3;
        }
    }
    else {
        gl_Position = vec4(1000000.0, 0.0, 0.0, 1.0);
    }
}