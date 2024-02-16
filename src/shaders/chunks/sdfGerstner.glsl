#include ./constants.glsl;

// Simplyfied version of Gerstner-waves adjusted for usage as signed-distance-field
float sdfGerstner(vec3 p, float time)
{
    float wavelength = 4.2;
    float speed = 0.0015;
    float amplitude = 0.25;
    float k = 2.0 * M_PI / wavelength;
    float f = k * ((p.z * 0.2 + p.x * 0.8 ) - speed * time);
    return amplitude * cos(f) + amplitude * sin(f) + p.y;
}
