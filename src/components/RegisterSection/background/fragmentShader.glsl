#version 300 es
precision highp float;
out vec4 fragColor;
in vec2 uv;
uniform float time;
uniform vec2 resolution;

#define srgbToLinear(c) pow(c, vec3(2.2))

const float timeCoefficient = 0.2;
/* Adjust this to change how saturated the colors are; this is very sensitive */
const float intensityCoefficient = 0.0010;

const int numLights = 4;
vec3 lightColors[numLights] = vec3[](
    srgbToLinear(vec3(110, 64, 242)/255.), // Purple
    srgbToLinear(vec3(232, 44, 162)/255.), // Pink
    srgbToLinear(vec3(255, 222, 0)/255.), // Yellow
    srgbToLinear(vec3(251, 84, 65)/255.)  // Orange
);


void main() {
    vec2 pos = uv * resolution  ;
    vec3 color = vec3(0.0);

    // Simulate light sources
    for (int i = 0; i < numLights; i++) {
        float px = sin(time * timeCoefficient + float(i) * 1.5) * 0.4 + 0.5;
        float py = cos(time * timeCoefficient + float(i) * 1.2) * 0.4 + 0.5;
        vec2 lightPos = vec2(px, py) * resolution;

        float dist = length(pos - lightPos);
        float intensity = exp(-dist * intensityCoefficient);

        color += lightColors[i] * intensity;
    }

    // Convert back to sRGB
    fragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
