// All function in have been taken from Inigo Quilez' work
// You can find them here: https://iquilezles.org/articles/distfunctions/

float merge(float a, float b)
{
    return min(a, b);
}

float opSmoothUnion( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opSmoothSubtraction( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float intersect(float a, float b)
{
    return max(a, b);
}

float subtract(float a, float b)
{
    return intersect(a, -b);
}
