/**
 * Vis 1 Task 1 Framework
 * Copyright (C) TU Wien
 *   Institute of Visual Computing and Human-Centered Technology
 *   Research Unit of Computer Graphics
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are not permitted.
 *
 * Shader material used for raycasting. Takes the volume data structure and the front and back face FBO cube as input.
 * Sets the transfer function control points.
 *
 * @author Manuela Waldner
 * @author Laura Luidolt
 * @author Diana Schalko
 */
class RayCastingShader extends Shader {
    constructor(volume, frontFBO, backFBO){
        super("raycasting_vert", "raycasting_frag"); //pseudoIsosurface_frag (previous isosurfacing)

        const volumeTexture = new THREE.DataTexture3D( volume.voxels, volume.width, volume.height, volume.depth );
        volumeTexture.format =  THREE.RedFormat;
        volumeTexture.type = THREE.FloatType;
        volumeTexture.minFilter = volumeTexture.magFilter = THREE.LinearFilter;
        volumeTexture.unpackAlignment = 1;
        volumeTexture.needsUpdate = true;

        this.maxControlPoints = 10; //must be the same as const int CONTROLPOINTS in shader

        this.setUniform("volume", volumeTexture);
        this.setUniform("frontCube", frontFBO.renderTarget.texture);
        this.setUniform("backCube", backFBO.renderTarget.texture);
    }


    setControlPoints(arr){

        let opacity = [];
        let color = [];

        for(let i = 0; i < this.maxControlPoints; i++){
            opacity.push(new THREE.Vector2(0,0));
            color.push(new THREE.Vector3(0,0,0));
        }

        for (let i = 0; i < arr.length; i++){
            let x = arr[i].xDensity;
            let y = arr[i].yIntensity;
            opacity[i] = new THREE.Vector2(x, y);
            let c = d3.color(arr[i].color);
            color[i] = new THREE.Vector3(c.r / 255.0, c.g / 255.0, c.b / 255.0);
        }

        this.setUniform("opacity", opacity, "v2v");
        this.setUniform("len", arr.length);
        this.setUniform("colors", color, "v3v");

    }

}

