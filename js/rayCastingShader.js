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

    setControlPoints(arrO, arrR, arrG, arrB){

        let arrOThree = [];
        let arrRThree = [];
        let arrGThree = [];
        let arrBThree = [];

        arrO.forEach(function(d){
            arrOThree.push(new  THREE.Vector2(d.xDensity, d.yIntensity));
        });

        arrR.forEach(function(d){
            arrRThree.push(new  THREE.Vector2(d.xDensity, d.yIntensity));
        });

        arrG.forEach(function(d){
            arrGThree.push(new  THREE.Vector2(d.xDensity, d.yIntensity));
        });

        arrB.forEach(function(d){
            arrBThree.push(new  THREE.Vector2(d.xDensity, d.yIntensity));
        });


        this.setUniform("redPoints", arrOThree, "v2v");
        this.setUniform("greenPoints", arrRThree, "v2v");
        this.setUniform("bluePoints", arrGThree, "v2v");
        this.setUniform("opacities", arrBThree, "v2v");

        this.setUniform("sizeOpacityArr", arrO.length);
        this.setUniform("sizeRedArr", arrR.length);
        this.setUniform("sizeGreenArr", arrG.length);
        this.setUniform("sizeBlueArr", arrB.length);



    }
}

