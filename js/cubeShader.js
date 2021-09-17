class CubeShader extends Shader{
    constructor(side, scale) {
        super("cube_vert", "cube_frag");
        this.setUniform("scale", new THREE.Vector3(scale[0], scale[1], scale[2]));
        this.material.side = side;
    }
}

