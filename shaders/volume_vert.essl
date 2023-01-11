uniform vec3 volume_dims;

out vec3 viewRay;
out vec3 transformedCamera;

void main() {
	// Compute eye position and ray directions in the unit cube space
	transformedCamera = (cameraPosition / volume_dims) + vec3(.5);
	vec3 newPosition = (position / volume_dims) + vec3(.5);
	viewRay = newPosition - transformedCamera;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}