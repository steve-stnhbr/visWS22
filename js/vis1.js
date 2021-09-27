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
 * Main script for Vis1 exercise. Loads the volume, initializes the scene, and contains the paint function.
 *
 * @author Manuela Waldner
 * @author Laura Luidolt
 * @author Diana Schalko
 */
let renderer, camera, scene, controls, orbitCamera;
let canvasWidth, canvasHeight = 0;
let container = null;
let frontFBO, backFBO = null;
let volume = null;
let fileInput = null;
let tf = null;
let testShader = null;

function init() {
    // volume viewer
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.7;
    canvasHeight = window.innerHeight * 0.7;

    // transfer function editor
    let transferFunctionElement = d3.select("#tfContainer");
    tf = new TransferFunction(window.innerWidth * 0.3, window.innerHeight * 0.7,
        transferFunctionElement, 40);

    // WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( canvasWidth, canvasHeight );
    container.appendChild( renderer.domElement );

    // read and parse volume file
    fileInput = document.getElementById("upload");
    fileInput.addEventListener('change', readFile);

    // dummy example for students
    testShader = new TestShader([255.0, 255.0, 0.0]);
}

function readFile(){
    let reader = new FileReader();
    reader.onloadend = function () {
        console.log("data loaded: ");

        let data = new Uint16Array(reader.result);
        volume = new Volume(data);

        resetVis();
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

async function resetVis(){
    // create new scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 1000 );
    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0,0,0), 2*volume.max, renderer.domElement);

    /* Keep this block for dummy scene given to students */
    const testCube = new THREE.BoxGeometry(100, 100, 100);
    const testMaterial = testShader.material;
    await testShader.load();
    const testMesh = new THREE.Mesh(testCube, testMaterial);
    //scene.add(testMesh);
    /* end dummy scene */

    // FBO front and back meshes
    let cube = new BoundingCube();
    let frontMesh = await cube.getFrontMesh(volume.scale);
    let backMesh = await cube.getBackMesh(volume.scale);
    frontFBO = new FBO(canvasWidth, canvasHeight, frontMesh, camera, renderer);
    backFBO = new FBO(canvasWidth, canvasHeight, backMesh, camera, renderer);

    // volume mesh
    const volumeMesh = await volume.getMesh(frontFBO, backFBO);
    scene.add(volumeMesh);

    // voxel densities to be shown in histogram
    tf.setHistogramData(volume.voxels, 0.25);

    // init paint loop
    requestAnimationFrame(paint);
}

function paint(){
    if (!volume) return;

    orbitCamera.update();

    frontFBO.renderToTexture(renderer, camera);
    backFBO.renderToTexture(renderer, camera);

    volume.setControlPoints(tf.getControlPoints());

    renderer.render(scene, camera);
}
