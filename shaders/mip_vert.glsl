varying vec4 nearPosV;
varying vec4 farPosV;
varying vec3 positionV;

uniform vec3 size;

void main() {
    vec3 volumeTranslation = vec3(.5) - size * .5;

    mat4 viewTransformF = modelViewMatrix;
    mat4 modelViewMatrixInv = inverse(modelViewMatrix);
    vec4 position4 = vec4(position, 1.0);
    vec4 camPosition = viewTransformF * position4;
    camPosition = vec4((vec3(camPosition) - volumeTranslation) / size, 1);
    camPosition.z = -camPosition.w;
    nearPosV = modelViewMatrixInv * camPosition;

    camPosition.z = camPosition.w;
    farPosV = modelViewMatrixInv * camPosition;

    positionV = position;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position * size + volumeTranslation, 1);
}