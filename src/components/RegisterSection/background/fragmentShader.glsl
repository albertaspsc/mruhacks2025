#version 300 es
precision highp float;
out vec4 fragColor;
in vec2 uv;
uniform float time;
uniform vec2 resolution;

#define srgbToLinear(c) pow(c, vec3(2.2))
#define linearToSrgb(c) pow(c, vec3(1.0 / 2.2))

const float timeCoefficient = 0.2;
/* Adjust this to change how saturated the colors are; this is very sensitive */
const float intensityCoefficient = 0.0012;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

const int numLights = 4;
vec3 lightColors[numLights] =
    vec3[](srgbToLinear(vec3(110, 64, 242) / 255.), // Purple
           srgbToLinear(vec3(232, 44, 162) / 255.), // Pink
           srgbToLinear(vec3(255, 222, 0) / 255.),  // Yellow
           srgbToLinear(vec3(251, 84, 65) / 255.)   // Orange
    );

void main() {
  vec2 pos = uv * resolution;
  float pixelSize = resolution[0] / 2.0;
  vec2 pixelatedUV = floor(uv * pixelSize) / pixelSize;
  vec3 baseColor = srgbToLinear(vec3(252., 251., 244.) / 255.);
  vec3 color = baseColor;

  float fadeFactor = exp(-gl_FragCoord.y / resolution[1] + 0.00001);
  fadeFactor = clamp(fadeFactor, 0.0, .5);

  // Simulate light sources
  for (int i = 0; i < numLights; i++) {
    float px = sin(time * timeCoefficient + float(i) * 1.5) * 0.4 + 0.5;
    float py = cos(time * timeCoefficient + float(i) * 1.2) * 0.4 + 0.5;
    vec2 lightPos = vec2(px, py) * resolution;

    float dist = length(pos - lightPos);
    float intensity = exp(-dist * intensityCoefficient);

    color = mix(lightColors[i], color, intensity);
  }

  color = linearToSrgb(color);
  float noiseValue = step(0.5, random(pixelatedUV + mod(time, 2.0))) / 10.0;
  fragColor = vec4(mix(baseColor, color + noiseValue, 0.8), 1.0);
}
