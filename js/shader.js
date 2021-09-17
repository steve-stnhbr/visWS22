class Shader {
    constructor(vertexProgram, fragmentProgram) {
        this.vertexProgram = vertexProgram;
        this.fragmentProgram = fragmentProgram;
        this.material = new THREE.ShaderMaterial
        ({
            uniforms: {},
            transparent: true
        });
    }

    async #loadShader(shader, name){
        const program = await d3.text("shaders/"+name+".essl");
        this.material[shader] = program;
    }

    // this function has to be explicitly called after the constructor from another async function like that:
    // await yourShader.load();
    async load(){
        await this.#loadShader("vertexShader", this.vertexProgram);
        await this.#loadShader("fragmentShader", this.fragmentProgram);
    }

    setUniform(key, value){
        this.material.uniforms[key] = new THREE.Uniform(value);
    }
}