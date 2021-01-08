/** Toy shader: renders the geometry with a given color **/
class ColorShader {
    constructor(color) {
        this.material = new THREE.ShaderMaterial
        ({
            uniforms: {
                color: new THREE.Uniform( new THREE.Vector3(color[0], color[1], color[2]) )
            },
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            transparent: true
        });
    }

    vertexShader(){
        return `
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }
        `;
    }

    fragmentShader(){
        return `
        uniform vec3 color; 
        
        void main(){
            gl_FragColor = vec4(color, 1.0); 
        }
        `;
    }
}