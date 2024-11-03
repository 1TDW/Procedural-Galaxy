precision mediump float;

attribute vec2 points;
attribute vec2 position;
attribute float size;

uniform vec2 resolution;
uniform vec3 camera;

varying float mass;
varying vec2 fragPos;

void main() {
    vec2 transform = points * size + position;

    vec2 cameraSpace = (transform - camera.xy) / camera.z;

    vec2 clipSpace = cameraSpace / resolution;

    vec2 screenSpace = clipSpace * vec2(2.0, -2.0);

    mass = size / 128.0;

    fragPos = transform;

    gl_Position = vec4(screenSpace, 0.0, 1.0);
}