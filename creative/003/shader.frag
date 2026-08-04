// Fragment shader
// This runs once per pixel

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform float u_scroll;
uniform vec2 u_resolution;
uniform vec2 u_mouse;


uniform vec3 u_repel_orbs[20];
//uniform int u_repel_orb_count;



void main() {
    // Aspect-correct UV: origin stays at canvas center for any aspect ratio
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;

    vec3 color = vec3(3,2,1);
    


    for (int i = 0; i < 20; i++) {
        vec3 obj = u_repel_orbs[i];

        float x = obj.x;
        float y = obj.y;
        float radius = obj.z;

        float d = distance(uv, vec2(x, y));

        float ball = 0.4 / d+0.005 + 0.2;

        color *= ball;
    }

    gl_FragColor = vec4(color, 1.0);
}
