class RayCastingShader extends Shader {
    constructor(volume, frontFBO, backFBO){
        super("raycasting_vert", "raycasting_frag"); //pseudoIsosurface_frag (previous isosurfacing)

        const volumeTexture = new THREE.DataTexture3D( volume.voxels, volume.width, volume.height, volume.depth );
        volumeTexture.format =  THREE.RedFormat;
        volumeTexture.type = THREE.FloatType;
        volumeTexture.minFilter = volumeTexture.magFilter = THREE.LinearFilter;
        volumeTexture.unpackAlignment = 1;
        volumeTexture.needsUpdate = true;

        this.setUniform("volume", volumeTexture);
        this.setUniform("frontCube", frontFBO.renderTarget.texture);
        this.setUniform("backCube", backFBO.renderTarget.texture);
        this.setIso(0.01);
    }

    setIso(iso){
        this.setUniform("iso", iso);
    }
}

