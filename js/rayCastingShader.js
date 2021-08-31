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
        
        
        vec3 light(vec3 color, vec3 viewDir, vec3 normal, float ambient, float diffuse){
            diffuse = diffuse * dot(-viewDir, normal); 
            return (ambient + diffuse) * color; 
        }
        
        void main(){
            vec3 uvw = vec3(vPosition.x, vPosition.y ,vPosition.z);
            vec3 start = texture(frontCube, texCoord).rgb; 
            vec3 end = texture(backCube, texCoord).rgb; 
            vec3 ray = end - start; 
            float rayLen = dot(ray, ray); 
            vec3 dir = normalize(ray); 
            vec3 step = dir * vec3(0.002); 
            float endDist = dot(end, end); 
            float startDist = dot(start, start); 
            
            // render bounding cube
            //gl_FragColor = vec4(vec3(rayLen * 0.5), 1.0); 
            
            vec3 color = vec3(0); 
            vec3 voxelColor = vec3(1); 
            
            
            vec3 rayPos = start;
            vec3 fragPos = vec3(0); 
            for (int i; i < 1024; i++) {
                vec3 insideRay = rayPos - start; 
                if(dot(insideRay, insideRay) > rayLen) break; 
                float voxel = texture(volume, rayPos.xyz).r;
                if(voxel >= iso){
                    //fragPos = vec3(1.0, 1.0, 1.0); 
                    vec3 normal = gradient(rayPos);
                    color = light(voxelColor, dir, normal, 0.2, 0.8); 
                    fragPos = rayPos; 
                    break; 
                }
                fragPos = vec3(rayLen * 0.5); 
                //fragPos = rayPos; 
                rayPos = rayPos + step; 
            }
            gl_FragColor = vec4(color, 1.0);
            //gl_FragColor = vec4(fragPos, 1.0); 
        }
        `;
    }
}