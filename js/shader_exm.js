class ShaderExm extends Shader {
    // constructor(size, style, iso, cLimit, data, colorMap) {
    //     super("example_vert", "example_frag");
    //     this.setUniform("u_size", new THREE.Vector3(size[0], size[1], size[2]), "vec3");
    //     this.setUniform("u_render_style", style, "int");
    //     this.setUniform("u_renderthreshold", iso, "float");
    //     this.setUniform("u_clim", new THREE.Vector2(cLimit[0], cLimit[1]), "vec2");
    //     this.setUniform("u_data", data, "sampler3D");
    //     this.setUniform("u_cmdata", colorMap, "sampler2D");
    // }

    constructor(data, colorMap, dims, iso) {
        super("volume_vert", "volume_frag");
        this.setUniform("volume", data, "sampler3D");
        this.setUniform("transfer_fcn", colorMap, "sampler2D");
        this.setUniform("volume_dims", new THREE.Vector3(dims[0], dims[1], dims[2]), 'vec3');
        this.setUniform("render_mode", 1, "int");
        this.setUniform("iso_value", iso, "float");
    }

}