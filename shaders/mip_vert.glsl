varying vec4 nearPosV;
varying vec4 farPosV;
varying vec3 positionV;

void main() {
    mat4 viewTransformF = modelViewMatrix;
    mat4 modelViewMatrixInv = inverse(modelViewMatrix);
    vec4 position4 = vec4(position, 1.0);
    vec4 camPosition = viewTransformF * position4;
    camPosition.z = -camPosition.w;
    nearPosV = modelViewMatrixInv * camPosition;

    camPosition.z = camPosition.w;
    farPosV = modelViewMatrixInv * camPosition;

    positionV = position;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position4;
}