// Fragment shader
// This runs once per pixel

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse1;
uniform vec2 u_mouse2;


vec3 palette(in float t)
{
    vec3 a = vec3(0.0, 1.0, 1.1);
    vec3 b = vec3(0.5, 1.0, 1.1);
    vec3 c = vec3(0.01, 0.05, 0.0);
    vec3 d = vec3(0, 0, 0.00);

    return a + b*cos(6.283185*(c*t+d));
}

vec2 swirl(vec2 p, float strength)
{
    float r = length(p);
    float angle = atan(p.y, p.x);
    // swirl amount increases with distance and time
    float twist = strength * (1.0 - r) * 2.0;
    angle += twist;
    return vec2(cos(angle), sin(angle)) * r;
}


void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec2 mouse1 = (u_mouse1 * 2.0 - u_resolution) / u_resolution.y;
    vec2 mouse2 = (u_mouse2 * 2.0 - u_resolution) / u_resolution.y;

    vec3 color = palette(u_time / 2.);


    float a = sin(u_time * 0.9);
    float b = sin(u_time * 1.);

    float combo = (a + b) * 0.5;

    float d2 = length(uv * combo);
    float c2 = 0.6/ d2;

    color *= c2;

    for (float i = 0.; i < 3.0; i++) {
        mouse2 = fract(mouse2*2.)-.5;
        mouse1 = fract(mouse1*2.)-.5;

        float d0 = length(uv - mouse2);
        float d1 = length(uv - mouse1);

        // Smooth edge (optional)
        float c0 = 0.05/ d0;
        float c1 = 0.05/ d1;

        float combined = c0 + c1;

        color *= combined;
    }


    gl_FragColor = vec4(color, 1.0);
}

