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

    fetch('../data/head_256x256x224.dat').then(res => res.blob().then(blob => readFile(blob)));
}

/**
 * Handles the file reader. No need to change anything here.
 */
function readFile(file) {
    let reader = new FileReader();
    reader.onloadend = function() {

        let data = new Uint16Array(reader.result);
        volume = new Volume(data);

        resetVis();
        setupD3();
    };
    reader.readAsArrayBuffer(file || fileInput.files[0]);
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
    // const shader = new ShaderImpl(
    //     [volume.width, volume.height, volume.depth],
    //     0,
    //     .34, [0, 1],
    //     dataTexture,
    //     await new THREE.TextureLoader().load('textures/cm_viridis.png'));

    const max = Math.max(volume.width, volume.height, volume.depth);

    const shader = new ShaderExm(
        dataTexture,
        await new THREE.TextureLoader().load('textures/cm_viridis.png'), [volume.width, volume.height, volume.depth],
        .3
    );
    await shader.load();
    const domain = new THREE.BoxGeometry(volume.width, volume.depth, volume.height);
    // domain.translate(volume.width / 2, volume.depth / 2, volume.height / 4);
    // position markers
    const domainMesh = new THREE.Mesh(domain, shader.material);
    scene.add(domainMesh);
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
    dataTexture.wrapR = dataTexture.wrapS = dataTexture.wrapT = THREE.ClampToEdgeWrapping;
    dataTexture.needsUpdate = true;
}

function setupD3() {
    var width = 50,
        height = 50;

    var margin = { top: 0, right: 0, bottom: 0, left: 0 };

    var bins = d3.histogram()
        .domain([0, 1])
        .thresholds(20)
        (volume.voxels);
    var x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width])

    // Set the scale for the y-axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height - margin.bottom, margin.top]);

    var svg = d3.select("#tfContainer").append("svg");

    svg.selectAll(".bar")
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.x0); })
        .attr("y", function(d) { return y(d.length); })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
        .attr("height", function(d) { return height - y(d.length) - margin.bottom; })
        .attr("color", "white");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x));

    // Append the y-axis to the visualization
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));
}