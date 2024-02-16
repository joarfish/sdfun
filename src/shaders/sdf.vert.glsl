in vec3 position;
out vec3 worldPosition;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main()
{
    worldPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
