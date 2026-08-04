// Vertex shader
// This runs once per vertex

attribute vec3 aPosition;

void main() {
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0; // Convert from (0,0)-(1,1) to (-1,-1)-(1,1)
    gl_Position = positionVec4;
}

