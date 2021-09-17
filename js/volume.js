// https://github.com/mrdoob/three.js/blob/master/examples/webgl2_materials_texture3d.html
class Volume {
    constructor(uint16Array) {
        this.width = uint16Array[0];
        this.height = uint16Array[1];
        this.depth = uint16Array[2];
        this.slice = this.width * this.height;
        this.size = this.slice * this.depth;
        //this.voxels = uint16Array.slice(3);
        this.max = Math.max(this.width, this.height, this.depth);
        this.scale = [this.width, this.height, this.depth];

        // const float value = float(vecData[i]) / 4095.0f;
        let floatArray = [];
        uint16Array.slice(3).forEach(function(voxel){
            floatArray.push(voxel / 4095.0);
        });
        this.voxels = Float32Array.from(floatArray);

        console.log(this.voxels.length + " voxels loaded - max: " + this.max);

        this.geometry = new THREE.PlaneGeometry( 2, 2 );
        this.material = null;
        this.shader = null;
    }

    async getMesh(frontFBO, backFBO){
        this.shader = new RayCastingShader(this, frontFBO, backFBO);
        await this.shader.load();
        this.material = this.shader.material;
        return new THREE.Mesh( this.geometry, this.material );
    }

    setIso(iso){
        this.shader.setIso(iso);
    }
}