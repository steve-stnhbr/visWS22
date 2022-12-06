precision highp int;
precision highp float;

uniform highp sampler3D volume;
// WebGL doesn't support 1D textures, so we use a 2D texture for the transfer function

uniform highp sampler2D transfer_fcn;
uniform ivec3 volume_dims;

in vec3 vray_dir;
flat in vec3 transformed_eye;

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

void main(void) {
	// Step 1: Normalize the view ray

	vec3 ray_dir = normalize(vray_dir);
    gl_FragColor = vec4(ray_dir, 1);
	// gl_FragColor = vec4(0.8784, 0.8784, 0.4706, 1.0);


	// Step 2: Intersect the ray with the volume bounds to find the interval

	// along the ray overlapped by the volume.

	vec2 t_hit = intersect_box(transformed_eye, ray_dir);
	if (t_hit.x > t_hit.y) {
		discard;
	}
	// We don't want to sample voxels behind the eye if it's

	// inside the volume, so keep the starting point at or in front

	// of the eye

	t_hit.x = max(t_hit.x, 0.0);

	// Step 3: Compute the step size to march through the volume grid

	vec3 dt_vec = 1.0 / (vec3(volume_dims) * abs(ray_dir));
	float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));

	// Step 4: Starting from the entry point, march the ray through the volume

	// and sample it
    vec4 color;
	vec3 p = transformed_eye + t_hit.x * ray_dir;
	for (float t = t_hit.x; t < t_hit.y; t += dt) {
		// Step 4.1: Sample the volume, and color it by the transfer function.

		// Note that here we don't use the opacity from the transfer function,

		// and just use the sample value as the opacity

		float val = texture(volume, p).r;
		vec4 val_color = vec4(texture(transfer_fcn, vec2(val, 0.5)).rgb, val);

		// Step 4.2: Accumulate the color and opacity using the front-to-back

		// compositing equation

		color.rgb += (1.0 - color.a) * val_color.a * val_color.rgb;
		// color.a += (1.0 - color.a) * val_color.a;
		color.a = float(1);

		// Optimization: break out of the loop when the color is near opaque

		if (color.a >= 0.95) {
			break;
		}
		p += ray_dir * dt;
	}
    gl_FragColor = color;
}





// precision highp float;
// precision mediump sampler3D;

// uniform vec3 size;
// uniform int renderStyle;
// uniform float isoThreshold;
// uniform vec2 cLimit;

// uniform sampler3D data;
// uniform sampler2D colorMap;

// varying vec3 positionV;
// varying vec4 nearPosV;
// varying vec4 farPosV;
// varying vec4 camPositionV;

// const float relativeStepSize = 1.0;
// const int MAX_STEPS = 1774;
// const int REFINEMENT_STEPS = 4;


// void castMIP(vec3 startLocation, vec3 step, int nSteps);
// void castISO(vec3 startLocation, vec3 step, int nSteps, vec3 viewRay);

// vec4 sampleColor(float val);

// void main() {
    
//     vec3 farPosition = farPosV.xyz / farPosV.w;
//     vec3 nearPosition = nearPosV.xyz / nearPosV.w;

//     vec3 viewRay = normalize(nearPosition.xyz - farPosition.xyz);

//     gl_FragColor = vec4(viewRay, 1);


//     float distance = dot(nearPosition - positionV, viewRay);

//     distance = max(distance, min((-0.5 - positionV.x) / viewRay.x,(size.x - 0.5 - positionV.x) / viewRay.x));
//     distance = max(distance, min((-0.5 - positionV.y) / viewRay.y,(size.y - 0.5 - positionV.y) / viewRay.y));
//     distance = max(distance, min((-0.5 - positionV.z) / viewRay.z,(size.z - 0.5 - positionV.z) / viewRay.z));

//     vec3 front = positionV + viewRay * distance;

//     int nSteps = int(-distance/relativeStepSize + .5);
//     if (nSteps < 1)
//         discard;
//     vec3 step = ((positionV - front) / size) / float(nSteps);
//     vec3 start = front / size;

//     // gl_FragColor = vec4(normalize(step) + vec3(.5), 1.0);
//     // return;
//     // gl_FragColor = vec4(texture(data, vec3(.4, .2, .1)).r * float(100));
//     // return;
//     // gl_FragColor = vec4(texture(data, front).r * float(100));
//     // return;
//     // gl_FragColor = vec4(0.0, float(nSteps) / 1.0 / size.x, 1.0, 1.0);
//     // return;
//     // gl_FragColor = vec4(gl_FragCoord.xyz / 255.0, 1.0);
//     // return;

//     if(renderStyle == 0)
//         castMIP(start, step, nSteps);
//     else if(renderStyle == 1)
//         castISO(start, step, nSteps, viewRay);

//     if (gl_FragColor.a < 0.05)
//         discard;
// }

// vec4 sampleColor(float val) {
//     val = (val - cLimit[0]) / (cLimit[1] - cLimit[0]);
//     return texture2D(colorMap, vec2(val, 0.5));
// }

// void castISO(vec3 start, vec3 step, int nSteps, vec3 viewRay) {
    
// }
// void castMIP(vec3 start, vec3 step, int nSteps) {
//     float maxVal = -1e6;
//     int maxI = 100;
//     vec3 loc = start;

//     for (int i = 0; i < MAX_STEPS; i++) {
//         if (i >= nSteps)
//             break;
//         float val = texture(data, loc.xyz).r;
//         if (val > maxVal) {
//             maxVal = val;
//             maxI = i;
//         }

//         loc += step;
//     }

//     vec3 refLoc = start + step * (float(maxI) - .5);
//     vec3 refStep = step / float(REFINEMENT_STEPS);
//     for (int i=0; i<REFINEMENT_STEPS; i++) {
//         maxVal = max(maxVal, texture(data, refLoc.xyz).r);
//         refLoc += refStep;
//     }

//     gl_FragColor = sampleColor(maxVal); 
    
// }
