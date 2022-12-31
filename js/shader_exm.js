class ShaderExm extends Shader {
    constructor(data, colorMap, dims, iso, indicators) {
        super("volume_vert", "volume_frag");
        this.setUniform("volume", data, "sampler3D");
        this.setUniform("transfer_fcn", colorMap, "sampler2D");
        this.setUniform("volume_dims", new THREE.Vector3(dims[0], dims[1], dims[2]), 'vec3');
        this.setUniform("render_mode", 1, "int");
        this.setUniform("iso_value", iso, "float");
        this.setUniform("indicators", this.prepareIndicators(indicators), "Indicator");
        this.material.transparent = true;
    }

    updateIndicators(indicators) {
        this.material.uniforms.indicators.value = this.prepareIndicators(indicators);
        this.material.needsUpdate = true;
    }

    prepareIndicators(indicators) {
        return Array.from({
            ...indicators.map(({ xValue, yValue, ...keep }) => keep),
            length: 5
        }, (v) => v || {
            opacity: 0,
            density: 0,
            color: new THREE.Vector3(1, 1, 1)
        });
    }

}