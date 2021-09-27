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
 * Creates the three shader material for the cube shader.
 *
 * @author Manuela Waldner
 */
class CubeShader extends Shader{
    constructor(side, scale) {
        super("cube_vert", "cube_frag");
        this.setUniform("scale", new THREE.Vector3(scale[0], scale[1], scale[2]));
        this.material.side = side;
    }
}

