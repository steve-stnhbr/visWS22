class RayCastingShader {
    constructor(volume, frontFBO, backFBO) {

        const volumeTexture = new THREE.DataTexture3D( volume.voxels, volume.width, volume.height, volume.depth );
        volumeTexture.format =  THREE.RedFormat; // THREE.RGBAFormat; //
        volumeTexture.type = THREE.FloatType; // THREE.UnsignedShort4444Type;
        volumeTexture.minFilter = volumeTexture.magFilter = THREE.LinearFilter;
        volumeTexture.unpackAlignment = 1;
        //this.texture.side = THREE.DoubleSide;

        volumeTexture.needsUpdate = true;

        console.log(volumeTexture);
        this.material = new THREE.ShaderMaterial
        ({
            uniforms: {
                volume: { value: volumeTexture },
                frontCube: { value: frontFBO.renderTarget.texture },
                backCube: { value: backFBO.renderTarget.texture },
                iso: { value: 0.01 }
            },
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            transparent: true
        });


        //this.material.uniforms['volume'].value = volumeTexture;

        // console.log(volumeTexture);
        // volumeTexture.image.data.forEach(function (v, i){
        //     if(v > 0){
        //         console.log(i + ": " + v);
        //     }
        // });
    }

    setIso(iso){
        this.material.uniforms['iso'].value = iso;
    }

    vertexShader(){
        return `
        varying vec3 vPosition; 
        varying vec2 texCoord; 
        
        void main() {
            vPosition = position; 
            texCoord = vec2(position.x, position.y) * 0.5 + 0.5; 
            //vec4 mvPosition = modelViewMatrix * vec4( position, 1.0);
            //gl_Position = projectionMatrix * mvPosition;
            gl_Position = vec4(position, 1); 
        }
        `;
    }

    fragmentShader(){
        return `
        precision highp sampler3D;
        
        uniform sampler3D volume; 
        uniform sampler2D frontCube;
        uniform sampler2D backCube;
        uniform float iso; 
        
        varying vec3 vPosition;
        varying vec2 texCoord; 
        
        vec3 gradient(vec3 uvw){
            vec3 s1, s2; 
            
            float DELTA = 0.01; 
            vec3 deltaU = vec3(DELTA,0.0,0.0); 
            vec3 deltaV = vec3(0.0,DELTA,0.0); 
            vec3 deltaW = vec3(0.0,0.0,DELTA);
            
            s1.x = texture(volume, uvw-deltaU).r;
            s2.x = texture(volume, uvw+deltaU).r;
            
            s1.y = texture(volume, uvw-deltaV).r;
            s2.y = texture(volume, uvw+deltaV).r;
            
            s1.z = texture(volume, uvw-deltaW).r;
            s2.z = texture(volume, uvw+deltaW).r;
            
            return normalize(s1-s2); 
        }
        
        
        vec3 Phong(vec3 viewDir, vec3 normal, vec3 color, float k_ambient, float k_diffuse, float k_specular)
        {
            float ambient  = k_ambient;
            float diffuse  = max(k_diffuse * dot(-viewDir, normal), 0.0);
            float shiny = max(dot(reflect(-viewDir, normal), viewDir), 0.0);
            float specular = k_specular * shiny * shiny * shiny;
            return (ambient + diffuse) * color + specular;
        }
        
        void main(){
            vec3 uvw = vec3(vPosition.x, vPosition.y ,vPosition.z);
            vec3 start = texture(frontCube, texCoord).rgb; 
            vec3 end = texture(backCube, texCoord).rgb; 
            vec3 ray = end - start; 
            float rayLenSquared = dot(ray, ray);
            vec3 dir = normalize(ray); 
            vec3 step = dir * vec3(0.001);
            //float endDist = dot(end, end);
            //float startDist = dot(start, start);
            
            // render bounding cube
            //gl_FragColor = vec4(vec3(rayLenSquared * 0.5), 1.0);
            
            vec3 color = vec3(0);
            vec3 voxelColor = vec3(0.8, 0.3, 0.3);
            
            vec3 rayPosPrev = start;
            float voxelPrev = texture(volume, rayPosPrev.xyz).r;

            vec3 rayPosCurr;
            float voxelCurr;

            vec3 fragPos = vec3(0.5);

            for (int i = 0; i < 2048; i++) {

                rayPosCurr = rayPosPrev + step;
                voxelCurr = texture(volume, rayPosCurr.xyz).r;

                vec3 insideRay = rayPosCurr - start;
                if(dot(insideRay, insideRay) > rayLenSquared) break;

                //checking voxelPrev < iso <= voxelCurr OR voxelCurr < iso <= voxelPrev
                float low = min(voxelPrev, voxelCurr);
                float high = max(voxelPrev, voxelCurr);

                if (low < iso && iso <= high) {

                    float interpolant = (iso - voxelPrev)/(voxelCurr - voxelPrev);

                    fragPos = rayPosPrev + (interpolant * step); // or mix(rayPosPrev, rayPosCurr, interpolant)

                    vec3 normal = gradient(fragPos);

                    color = Phong(dir, normal, voxelColor, 0.3, 0.7, 0.2);

                    rayPosPrev = normal;
                    break;
                }

                rayPosPrev = rayPosCurr;
                voxelPrev = voxelCurr;
            }
            gl_FragColor = vec4(color, 1.0);
            //gl_FragColor = vec4(fragPos, 1.0); 
        }
        `;
    }
}