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
let renderer, camera, scene, orbitCamera;
let canvasWidth, canvasHeight = 0;
let container = null;
let volume = null;
let dataTexture = null;
let fileInput = null;
let testShader = null;

/**
 * Load all data and initialize UI here.
 */
function init() {
    // volume viewer
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.7;
    canvasHeight = window.innerHeight * 0.7;

    // WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvasWidth, canvasHeight);
    container.appendChild(renderer.domElement);

    // read and parse volume file
    fileInput = document.getElementById("upload");
    fileInput.addEventListener('change', readFile);
}

/**
 * Handles the file reader. No need to change anything here.
 */
function readFile() {
    let reader = new FileReader();
    reader.onloadend = function() {
        console.log("data loaded: ");

        let data = new Uint16Array(reader.result);
        volume = new Volume(data);

        resetVis();
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

/**
 * Construct the THREE.js scene and update histogram when a new volume is loaded by the user.
 *
 * Currently renders the bounding box of the volume.
 */
async function resetVis() {
    // create new empty scene and perspective camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);

    volumeToDataTexture3D();
    const shader = new ShaderImpl([volume.width, volume.depth, volume.height], 0, .34, [0, 1], dataTexture, await new THREE.TextureLoader().load('textures/cm_viridis.png'));
    await shader.load();
    const domain = new THREE.BoxGeometry(volume.width, volume.height, volume.depth);
    domain.translate(100, 100, 100);
    const center = new THREE.BoxGeometry(20, 20, 20);
    const x = new THREE.BoxGeometry(20, 20, 20);
    x.translate(100, 0, 0);
    const y = new THREE.BoxGeometry(20, 20, 20);
    y.translate(0, 100, 0);
    const z = new THREE.BoxGeometry(20, 20, 20);
    z.translate(0, 0, 100);
    const domainMesh = new THREE.Mesh(domain, shader.material);
    const centerMesh = new THREE.Mesh(center, new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ffffff")
    }));
    const xMesh = new THREE.Mesh(x, new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ff0000")
    }));
    const yMesh = new THREE.Mesh(y, new THREE.MeshBasicMaterial({
        color: new THREE.Color("#00ff00")
    }));
    const zMesh = new THREE.Mesh(z, new THREE.MeshBasicMaterial({
        color: new THREE.Color("#0000ff")
    }));
    scene.add(domainMesh);
    scene.add(centerMesh);
    scene.add(xMesh);
    scene.add(yMesh);
    scene.add(zMesh);

    // our camera orbits around an object centered at (0,0,0)
    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0, 0, 0), 2 * volume.max, renderer.domElement);

    // init paint loop
    requestAnimationFrame(paint);
}

/**
 * Render the scene and update all necessary shader information.
 */
function paint() {
    if (volume) {
        renderer.render(scene, camera);
    }
}


function volumeToDataTexture3D() {
    dataTexture = new THREE.Data3DTexture(volume.voxels, volume.width, volume.height, volume.depth);
    dataTexture.format = THREE.RedFormat;
    dataTexture.type = THREE.FloatType;
    dataTexture.minFilter = dataTexture.magFilter = THREE.LinearFilter;
    dataTexture.unpackAlignment = 1;
    dataTexture.needsUpdate = true;
}