class TestShader extends Shader{
    constructor(color){
        super("color_vert", "color_frag");
        this.setUniform("color", new THREE.Vector3(color[0], color[1], color[2]));
    }
}