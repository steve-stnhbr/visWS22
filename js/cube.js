class BoundingCube{
    constructor(){
        this.geometry = new THREE.BoxGeometry();
    }

    async getMesh(side, scale){
        const shader = new CubeShader(side, scale);
        await shader.load();
        const material = shader.material;
        return new THREE.Mesh( this.geometry, material );
    }

    async getFrontMesh(scale){
        return await this.getMesh(THREE.FrontSide, scale);
    }

    async getBackMesh(scale){
        return await this.getMesh(THREE.BackSide, scale);
    }

}