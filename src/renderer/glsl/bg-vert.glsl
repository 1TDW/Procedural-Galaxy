precision mediump float;

attribute vec2 position;

uniform vec2 resolution;
uniform vec3 camera;

varying vec2 fragPos;

void main() {
    vec2 cameraSpace = (position - camera.xy) / camera.z;

    vec2 clipSpace = cameraSpace / resolution;

    vec2 screenSpace = clipSpace * vec2(2.0, -2.0);

    fragPos = position;

    gl_Position = vec4(screenSpace, 0.0, 1.0);
}