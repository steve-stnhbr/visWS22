class BoundingCube{
    constructor(){
        this.geometry = new THREE.BoxGeometry();
    }

    getMesh(side, scale){
        //const material = new THREE.MeshBasicMaterial( { color: this.color, side: side} );
        const material = new CubeShader(side, scale).material;
        return new THREE.Mesh( this.geometry, material );
    }

    getFrontMesh(scale){
        return this.getMesh(THREE.FrontSide, scale);
    }

    getBackMesh(scale){
        return this.getMesh(THREE.BackSide, scale);
    }

}