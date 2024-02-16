precision highp float;
precision highp int;

#include ./chunks/sdfGerstner.glsl;
#include ./chunks/raymarch.glsl;
#include ./chunks/sdfOperations.glsl;
#include ./chunks/sdfShapes.glsl;

uniform float time;
uniform vec3 cameraPosition;
uniform vec3 bubbleAt;
uniform float bubbleStartTime;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform vec3 lightPosition;

in vec3 worldPosition;
layout(location = 0) out vec4 outColor;

float sdfInnerBowl(vec3 p)
{
    return sdfEllipsoid(p, vec3(0.0, 0.0, 0.0), vec3(4.0, 4.0, 4.0));
}

float sdfScene(vec3 p)
{
    float oceanBowl = intersect(
        sdfGerstner(p, time),
        sdfInnerBowl(p)
    );

    if (bubbleAt.x == 0.0 && bubbleAt.y == 0.0 && bubbleAt.z == 0.0) {
        return oceanBowl;
    }

    float dTime = time - bubbleStartTime;

    // The first half second the bubble will move slower:
    float animTime = dTime / (2000.0 + 5000.0*smoothstep(500.0, 0.0, dTime));

    return opSmoothUnion(
        oceanBowl,
        sdfSphere(p, vec3(bubbleAt.x, bubbleAt.y + 10.0 * animTime, bubbleAt.z), 0.4),
        0.95
    );
}

// Generate inferNormal function
MAKE_INFER_NORMAL(sdfScene)
// Generate raymarch-function
MAKE_RAYMARCH(sdfScene)

const vec3 lightColor = vec3(1.0, 1.0, 1.0);
const float lightPower = 400.0;
const vec3 ambientColor = vec3(0.02, 0.02, 0.02);
const vec3 specColor = vec3(0.5, 0.5, 0.5);
const float shininess = 4.0;
const float screenGamma = 1.0;

void main()
{
    vec3 startingPoint = worldPosition - cameraPosition;
    vec3 direction = normalize(startingPoint);
    float surfaceDistance = raymarch(cameraPosition, direction, length(startingPoint));
    if (surfaceDistance == RAYMARCH_MISS) {
        discard;
    }
    vec3 surfacePosition = cameraPosition + surfaceDistance * direction;
    vec3 normal = inferNormal(surfacePosition);
    vec3 oceanColor = vec3(0.008, 0.388, 0.763);

    // LIGHTING START
    float alpha = 1.0;
    if ( alpha < 0.01) discard;

    vec3 viewDir = normalize(cameraPosition - surfacePosition);

    vec3 lightDir = lightPosition - surfacePosition;
    float lightDistance = length(lightDir);
    lightDistance = lightDistance * lightDistance;
    lightDir = normalize(lightDir);

    float lambertian = max(dot(lightDir, normal), 0.0);
    float specular = 0.0;

    if (lambertian > 0.0) {
        vec3 viewDir = normalize(cameraPosition-surfacePosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float specAngle = max(dot(halfDir, normal), 0.0);
        specular = pow(specAngle, shininess);
    }

    vec3 colorLinear = ambientColor +
        oceanColor * lambertian * lightColor * lightPower / lightDistance +
        specColor * specular * lightColor * lightPower / lightDistance;

    vec3 colorGammaCorrected = pow(colorLinear, vec3(1.0 / screenGamma));
    outColor = vec4(colorGammaCorrected, alpha);
    // LIGHTING END

    gl_FragDepth = calculateFragmentDepth(projectionMatrix, viewMatrix, surfacePosition);
}
