// All function in have been taken from Inigo Quilez' work
// You can find them here: https://iquilezles.org/articles/distfunctions/

float sdfSphere(vec3 p, vec3 pos, float radius)
{
    return length(pos - p) - radius;
}

float sdfEllipsoid(vec3 p, vec3 pos, vec3 r)
{
    float k0 = length((p-pos)/r);
    float k1 = length((p-pos)/(r*r));
    return k0*(k0-1.0)/k1;
}

float sdfBox(vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdfPlane(vec3 p, vec3 n, float h)
{
    // n must be normalized
    return dot(p,n) + h;
}
