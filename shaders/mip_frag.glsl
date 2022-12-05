precision highp float;
precision mediump sampler3D;

uniform vec3 size;
uniform int renderStyle;
uniform float isoThreshold;
uniform vec2 cLimit;

uniform sampler3D data;
uniform sampler2D colorMap;

varying vec3 positionV;
varying vec4 nearPosV;
varying vec4 farPosV;
varying vec4 camPositionV;

const float relativeStepSize = 1.0;
const int MAX_STEPS = 1774;
const int REFINEMENT_STEPS = 4;


void castMIP(vec3 startLocation, vec3 step, int nSteps);
void castISO(vec3 startLocation, vec3 step, int nSteps, vec3 viewRay);

vec4 sampleColor(float val);

void main() {
    
    vec3 farPosition = farPosV.xyz / farPosV.w;
    vec3 nearPosition = nearPosV.xyz / nearPosV.w;

    vec3 viewRay = normalize(nearPosition.xyz - farPosition.xyz);

    float distance = dot(nearPosition - positionV, viewRay);

    distance = max(distance, min((-0.5 - positionV.x) / viewRay.x,(size.x - 0.5 - positionV.x) / viewRay.x));
    distance = max(distance, min((-0.5 - positionV.y) / viewRay.y,(size.y - 0.5 - positionV.y) / viewRay.y));
    distance = max(distance, min((-0.5 - positionV.z) / viewRay.z,(size.z - 0.5 - positionV.z) / viewRay.z));

    vec3 front = positionV + viewRay * distance;

    int nSteps = int(-distance/relativeStepSize + .5);
    if (nSteps < 1)
        discard;
    vec3 step = ((positionV - front) / size) / float(nSteps);
    vec3 start = front / size;

    // gl_FragColor = vec4(normalize(step) + vec3(.5), 1.0);
    // return;
    // gl_FragColor = vec4(texture(data, vec3(.4, .2, .1)).r * float(100));
    // return;
    // gl_FragColor = vec4(texture(data, front).r * float(100));
    // return;
    // gl_FragColor = vec4(0.0, float(nSteps) / 1.0 / size.x, 1.0, 1.0);
    // return;
    // gl_FragColor = vec4(gl_FragCoord.xyz / 255.0, 1.0);
    // return;

    if(renderStyle == 0)
        castMIP(start, step, nSteps);
    else if(renderStyle == 1)
        castISO(start, step, nSteps, viewRay);

    if (gl_FragColor.a < 0.05)
        discard;
}

vec4 sampleColor(float val) {
    val = (val - cLimit[0]) / (cLimit[1] - cLimit[0]);
    return texture2D(colorMap, vec2(val, 0.5));
}

void castISO(vec3 start, vec3 step, int nSteps, vec3 viewRay) {
    
}
void castMIP(vec3 start, vec3 step, int nSteps) {
    float maxVal = -1e6;
    int maxI = 100;
    vec3 loc = start;

    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= nSteps)
            break;
        float val = texture(data, loc.xyz).r;
        if (val > maxVal) {
            maxVal = val;
            maxI = i;
        }

        loc += step;
    }

    vec3 refLoc = start + step * (float(maxI) - .5);
    vec3 refStep = step / float(REFINEMENT_STEPS);
    for (int i=0; i<REFINEMENT_STEPS; i++) {
        maxVal = max(maxVal, texture(data, refLoc.xyz).r);
        refLoc += refStep;
    }

    gl_FragColor = sampleColor(maxVal); 
    
}
