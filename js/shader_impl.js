class ShaderImpl extends Shader {
    constructor(size, style, iso, cLimit, data, colorMap) {
        super("mip_vert", "mip_frag");
        this.setUniform("size", new THREE.Vector3(size[0], size[1], size[2]), "vec3");
        this.setUniform("renderStyle", style, "int");
        this.setUniform("isoThreshold", iso, "float");
        this.setUniform("cLimit", new THREE.Vector2(cLimit[0], cLimit[1]), "vec2");
        this.setUniform("data", data, "sampler3D");
        this.setUniform("colorMap", colorMap, "sampler2D");
    }

}