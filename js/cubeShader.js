class CubeShader {
    constructor(side, scale) {
        this.material = new THREE.ShaderMaterial
        ({
            uniforms: {
                scale: new THREE.Uniform( new THREE.Vector3(scale[0], scale[1], scale[2]) )
            },
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            transparent: true,
            side: side
        });
    }

    vertexShader(){
        return `
        varying vec3 vPosition; 
        uniform vec3 scale; 
        
        void main() {
            vPosition = position + vec3(0.5, 0.5, 0.5); 
            vec4 mvPosition = modelViewMatrix * vec4( position * scale, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }
        `;
    }

    fragmentShader(){
        return `
        varying vec3 vPosition;
        
        void main(){
            vec3 uvw = vec3(vPosition.x, vPosition.y ,vPosition.z);
            gl_FragColor = vec4(uvw, 1.0); 
        }
        `;
    }
}
