precision mediump float;

uniform float shaderType;
uniform float lod;

varying vec2 fragPos;

float round(float n) {
    return floor(n + 0.5);
}

vec2 round(vec2 n) {
    return vec2(round(n.x), round(n.y));
}

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 getColorOf(float mass) {
    vec3 color = vec3(1.0, 1.0, 1.0); 

    vec3 red = vec3(1.0, 0.5, 0.2);
    vec3 yellow = vec3(1.0, 1.0, 0.6);
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 blue = vec3(0.5, 0.7, 1.0);

    float RED_LIM = 0.05;
    float YELLOW_LIM = 0.075;
    float WHITE_LIM = 0.2;
    float BLUE_LIM = 0.4;

    if (mass <= RED_LIM) {
        color = red;
    } else if (mass <= YELLOW_LIM) {
        color = mix(red, yellow, (mass - RED_LIM) / (YELLOW_LIM - RED_LIM));
    } else if (mass <= WHITE_LIM) {
        color = mix(yellow, white, (mass - YELLOW_LIM) / (WHITE_LIM - YELLOW_LIM));
    } else if (mass <= BLUE_LIM) {
        color = mix(white, blue, (mass - WHITE_LIM) / (BLUE_LIM - WHITE_LIM));
    } else {
        color = blue;
    }

    return color;
}

void main() {
    vec2 seed = mod(round(fragPos), 1000.0);

    float value = (rand(seed) + rand(seed.yx)) / 2.0;

    float brightness = pow(value, 5.0 - lod / 2.0);

    float LOD_MIN = 0.75;
    float LOD_MAX = 2.0;

    if (lod < LOD_MIN) {
        brightness = 0.0;
    }

    if (lod >= LOD_MIN && lod < LOD_MAX) {
        brightness = mix(0.0, brightness, (lod - LOD_MIN) / (LOD_MAX - LOD_MIN));
    }

    if (brightness < 0.5) {
        brightness /= 1.5;
    }

    if (brightness > 0.9 && lod >= 3.0) {
        brightness = brightness * 2.0;
    }

    vec3 color = vec3(0.0, 0.0, 0.0);

    if (shaderType == 1.0) {
        color = getColorOf(brightness / 4.0) * brightness / 4.0;
    } else if (shaderType == 2.0) {
        color = vec3(brightness / 4.0);
    } else if (shaderType == 3.0) {
        color = vec3(fragPos.x / 999999.0, 1.0 - fragPos.x / 999999.0, 0.5 + fragPos.y / 999999.0);
        color *= brightness / 4.0;
    }
 
    gl_FragColor = vec4(color, 1.0);
}