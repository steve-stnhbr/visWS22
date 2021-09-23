class RayCastingShader extends Shader {
    constructor(volume, frontFBO, backFBO){
        super("raycasting_vert", "raycasting_frag"); //pseudoIsosurface_frag (previous isosurfacing)

        const volumeTexture = new THREE.DataTexture3D( volume.voxels, volume.width, volume.height, volume.depth );
        volumeTexture.format =  THREE.RedFormat;
        volumeTexture.type = THREE.FloatType;
        volumeTexture.minFilter = volumeTexture.magFilter = THREE.LinearFilter;
        volumeTexture.unpackAlignment = 1;
        volumeTexture.needsUpdate = true;

        this.maxControlPoints = 4; //must be the same as const int CONTROLPOINTS in shader

        this.setUniform("volume", volumeTexture);
        this.setUniform("frontCube", frontFBO.renderTarget.texture);
        this.setUniform("backCube", backFBO.renderTarget.texture);
        this.setIso(0.01);
    }

    setIso(iso){
        this.setUniform("iso", iso);
    }

    setControlPoints(arrO, arrR, arrG, arrB){

        this.setControlPointsChannel(arrO, "opacity");
        this.setControlPointsChannel(arrR, "red");
        this.setControlPointsChannel(arrG, "green");
        this.setControlPointsChannel(arrB, "blue");

    }

    setControlPointsChannel(arr, color){
        let arrThree = [];

        let diff = this.maxControlPoints - arr.length;

        if (diff > 0){
            for (let i = 0; i < diff; i++) {
                let x = arr[i].xDensity;
                let y = arr[i].yIntensity;
                arrThree.push(new THREE.Vector2(x, y));
            }
            for(let j = diff; j < this.maxControlPoints; j++){
                arrThree.push(new THREE.Vector2(0, 0));
            }
        }
        else{
            arr.forEach(function(d){
                arrThree.push(new THREE.Vector2(d.xDensity, d.yIntensity));
            });
        }

        console.log(arrThree);
        this.setUniform(color, arrThree, "v2v");
        this.setUniform(color+"Len", arr.length);
    }
}

