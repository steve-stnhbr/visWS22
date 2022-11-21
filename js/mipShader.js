class MIPShader extends Shader {
    constructor(data) {
        super("mip_vert", "mip_frag");
        this.setUniform("data", data, "sampler3D");
    }

}