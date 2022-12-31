precision highp int;
precision highp float;

struct Indicator {
	float opacity;
	float density;
	vec3 color;
};

uniform Indicator indicators[5];

uniform highp sampler3D volume;

uniform highp sampler2D transfer_fcn;
uniform vec3 volume_dims;
uniform lowp int render_mode;
uniform mediump float iso_value;

in vec3 viewRay;
in vec3 transformedCamera;

const highp float pi = 3.1415926538;
const vec3 lightColor = vec3(0.4588, 0.4588, 0.4588);
const float shininess = .01;
const vec3 ambientColor = vec3(.1);

const lowp int AMBIENT_OCCLUSION_RAY_AMOUNT = 50;
const lowp float F_AMBIENT_OCCLUSION_RAY_AMOUNT = float(AMBIENT_OCCLUSION_RAY_AMOUNT);
const lowp float AMBIENT_OCCLUSION_RAY_LENGTH = .5;

void castMIP(vec3 start, vec3 step, float stepSize, int stepAmount);
void castFirstHit(vec3 start, vec3 step, float stepSize, int stepAmount, float iso, vec4 color);
float sampleVolume(vec3 pos);
vec4 calculateLighting(vec3 position, vec3 normal, float ambienOcclusion, vec4 baseColor);
float calculateAmbientOcclusion(vec3 pos, float stepSize);

vec2 intersect_box(vec3 orig, vec3 dir) {
	const vec3 box_min = vec3(0);
	const vec3 box_max = vec3(1);
	vec3 inv_dir = 1.0 / dir;
	vec3 tmin_tmp = (box_min - orig) * inv_dir;
	vec3 tmax_tmp = (box_max - orig) * inv_dir;
	vec3 tmin = min(tmin_tmp, tmax_tmp);
	vec3 tmax = max(tmin_tmp, tmax_tmp);
	float t0 = max(tmin.x, max(tmin.y, tmin.z));
	float t1 = min(tmax.x, min(tmax.y, tmax.z));
	return vec2(t0, t1);
}


vec4 sampleColor(float val) {
    return texture2D(transfer_fcn, vec2(val, 0.5));
}

void main() {
	// Step 1: Normalize the view ray
	vec3 ray_dir = normalize(viewRay);

	// Step 2: Intersect the ray with the volume bounds to find the interval
	// along the ray overlapped by the volume.
	vec2 t_hit = intersect_box(transformedCamera, ray_dir);
	if (t_hit.x > t_hit.y) {
		discard;
	}

	// We don't want to sample voxels behind the eye if it's
	// inside the volume, so keep the starting point at or in front
	// of the eye
	t_hit.x = max(t_hit.x, 0.0);
	
	// Step 3: Compute the step size to march through the volume grid
	vec3 dt_vec = 1.0 / (volume_dims * abs(ray_dir));
	float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));

	// Step 4: Starting from the entry point, march the ray through the volume
	// and sample it
	vec3 start = transformedCamera + t_hit.x * ray_dir;
	int stepAmount = int((t_hit.y - t_hit.x) / dt) + 1;

	if (render_mode == 0) {
		castMIP(start, ray_dir, dt, stepAmount);
	} else if (render_mode == 1) {
		for (int i = 0; i < 5; i++) {
			if (indicators[i].opacity > 0.) {
				castFirstHit(
					start, 
					ray_dir, 
					dt, 
					stepAmount, 
					indicators[i].density, 
					vec4(indicators[i].color, indicators[i].opacity)
				);
			}
		}
	}
}

void castMIP(vec3 start, vec3 step, float stepSize, int stepAmount) {
	float maxVal = .0;

    for (int i = 0; i < stepAmount; i++) {
        float val = sampleVolume(start.xyz);
        if (val > maxVal) {
            maxVal = val;
        }
		start += step * stepSize;
    }
	gl_FragColor = sampleColor(maxVal);
	// gl_FragColor = vec4(1, 1, 1, maxVal);
}

void castFirstHit(highp vec3 start, highp vec3 step, highp float stepSize, int stepAmount, float iso, vec4 baseColor) {
	float epsilon = stepSize / 2.;
	float epsilonX = 1. / volume_dims.x;
	float epsilonY = 1. / volume_dims.y;
	float epsilonZ = 1. / volume_dims.z;
    for (int i = 0; i < stepAmount; i++) {
        float val = sampleVolume(start.xyz);
        if (val >= iso) {
			vec3 surfaceNormal = normalize(vec3(
				sampleVolume((start - vec3(epsilonX, 0.0, 0.0))) - sampleVolume(start + vec3(epsilonX, 0.0, 0.0)),
				sampleVolume((start - vec3(0.0, epsilonY, 0.0))) - sampleVolume(start + vec3(0.0, epsilonY, 0.0)),
				sampleVolume((start - vec3(0.0, 0.0, epsilonZ))) - sampleVolume(start + vec3(0.0, 0.0, epsilonZ))
			));

			float ambientOcclusion = calculateAmbientOcclusion(start, stepSize);
			gl_FragColor = vec4(vec3(ambientOcclusion), 1);
			gl_FragColor = vec4(surfaceNormal, 1);
			// gl_FragColor = vec4(epsilonX, epsilonY, epsilonZ, 1);
			gl_FragColor = calculateLighting(start, surfaceNormal, 1., baseColor);
			return;
        }
        start += step * stepSize;
    }
}

float sampleVolume(vec3 pos) {
	return texture(volume, pos).r;
}

vec4 calculateLighting(vec3 pos, vec3 normal, float ambientOcclusion, vec4 baseColor) {
	// Light position
	vec3 lightPosition = cameraPosition;

	// View position
	vec3 viewPosition = cameraPosition;

	// Calculate the diffuse lighting component
	vec3 lightDirection = normalize(lightPosition - pos);
	vec3 diffuse = ambientOcclusion * max(dot(normal, lightDirection), 0.0) * lightColor;

	// Calculate the specular lighting component
	vec3 reflectDirection = reflect(-lightDirection, normal);
	vec3 specular = pow(max(dot(reflectDirection, normalize(viewPosition - pos)), 0.0), shininess) * lightColor;

	// Calculate the final color
	vec3 color = ambientColor + diffuse + specular;
	return baseColor * vec4(color, 1);
}

float calculateAmbientOcclusion(vec3 pos, float stepSize) {
	float occlusion = .0f;
	for (int i = 0; i < AMBIENT_OCCLUSION_RAY_AMOUNT; i++) {
		float fi = float(i);

		// Compute the polar and azimuthal angles
		float theta = fi * pi / F_AMBIENT_OCCLUSION_RAY_AMOUNT;
		float phi = pi * (fi + 0.5) / F_AMBIENT_OCCLUSION_RAY_AMOUNT;

    	// Compute the direction of the ray
    	vec3 rayDirection = vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
		
		float length = .001;
		while (length < AMBIENT_OCCLUSION_RAY_LENGTH) {
			vec3 rayPosition = pos + length * rayDirection;
			if (sampleVolume(rayPosition) > .3f) {
				occlusion += 1.;
            	break;
			}

			length += stepSize / 2.;
		}
	}

	return occlusion /= F_AMBIENT_OCCLUSION_RAY_AMOUNT;
}