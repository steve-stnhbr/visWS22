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
 * Class for rendering a given mesh into an offscreen FBO texture with a given dimension.
 * The rendered image can be accessed through renderTarget.texture.
 * Inspired by: https://gamedevelopment.tutsplus.com/tutorials/quick-tip-how-to-render-to-a-texture-in-threejs--cms-25686
 *
 * @author Manuela Waldner
 */
class FBO {
    constructor(width, height, mesh) {
        this.scene = new THREE.Scene();
        this.scene.add(mesh);

        this.renderTarget = new THREE.WebGLRenderTarget
        (
            width, height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter
            }
            );
    }

    renderToTexture(renderer, camera){
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.scene, camera);
        renderer.setRenderTarget(null);
    }
}