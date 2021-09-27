/**
 *  Vis 1 Task 1 Framework
 * Copyright (C) TU Wien
 *   Institute of Visual Computing and Human-Centered Technology
 *   Research Unit of Computer Graphics
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are not permitted.
 *
 * Bounding cube for the volume. Creates a mesh for both, front and back side, using the CubeShader material.
 *
 * @author Manuela Waldner
 */
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