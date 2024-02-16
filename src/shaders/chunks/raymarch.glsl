#define MAX_MARCHING_STEPS 1000
#define EPSILON 0.0001
#define N_EPSILON 0.0001
#define RAYMARCH_MISS 1337.0

/**
 * Factory Macro to generate a raymarching function for a scene's sdf function
 * Expected signature for sdfSceneFn: float sdfSceneFn(vec3 pos)
 */
#define MAKE_RAYMARCH(sdfSceneFn) \
float raymarch(vec3 eye, vec3 viewRayDirection, float start) { \
    float depth = start; \
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) { \
        float dist = sdfSceneFn(eye + depth * viewRayDirection); \
        if (dist < EPSILON) { \
            return depth; \
        } \
        depth += dist; \
        if (depth >= RAYMARCH_MISS) { \
            return RAYMARCH_MISS; \
        } \
    } \
    return RAYMARCH_MISS; \
}

/**
 * Calculates the fragments depth based on the raymarched surface position.
 */
float calculateFragmentDepth(mat4 projectionMatrix, mat4 viewMatrix, vec3 surfacePosition)
{
    // To calculate the depth we need to transform the surface position to NDC:
    vec4 projectedPos = projectionMatrix * viewMatrix * vec4(surfacePosition, 1.0);
    return (1.0) / 2.0 * (projectedPos.z / projectedPos.w) + (1.0) / 2.0;
}

#define __EPSILON_SCENE_VEC(sdfScene,surfacePosition,op) \
    vec3( \
        sdfScene(surfacePosition op vec3(N_EPSILON, 0.0, 0.0)), \
        sdfScene(surfacePosition op vec3(0.0, N_EPSILON, 0.0)), \
        sdfScene(surfacePosition op vec3(0.0, 0.0, N_EPSILON)) \
    )

/**
 * Factory Macro to generate a inferNormal function that returns the normal
 * for a point on the surface of a scene.
 * Expected signature for sdfSceneFn: float sdfSceneFn(vec3 pos)
 */
#define MAKE_INFER_NORMAL(sdfSceneFn) \
vec3 inferNormal(vec3 surfacePosition) { \
    return normalize( \
        __EPSILON_SCENE_VEC(sdfSceneFn,surfacePosition,+) - __EPSILON_SCENE_VEC(sdfSceneFn,surfacePosition,-) \
    ); \
}
