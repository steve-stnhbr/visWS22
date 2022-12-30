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
let shader = null;
let domainMesh = null;

let mouseDown = false;

let indicators = [];

class Indicator {
    xValue;
    density;
    color;
}

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

    window.onmousedown = () => mouseDown = true;
    window.onmouseup = window.onmouseleave = () => mouseDown = false;
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
    reader.readAsArrayBuffer(fileInput.files[0] || file);
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

    shader = new ShaderExm(
        dataTexture,
        await new THREE.TextureLoader().load('textures/cm_viridis.png'), [volume.width, volume.height, volume.depth],
        .3
    );

    console.log(shader.material.uniforms);
    await shader.load();
    const domain = new THREE.BoxGeometry(volume.width, volume.depth, volume.height);
    // domain.translate(volume.width / 2, volume.depth / 2, volume.height / 4);
    // position markers
    domainMesh = new THREE.Mesh(domain, shader.material);
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
    const histogramElement = document.getElementById("tfContainer");
    if (histogramElement.firstChild)
        histogramElement.removeChild(histogramElement.firstChild);
    const width = histogramElement.offsetWidth,
        height = width * 3 / 4;

    const margin = { top: 20, right: 15, bottom: 0, left: 0 };
    const padding = 1;
    const amount = 50;
    const indicatorRadius = 10;

    var bins = d3.histogram()
        .domain([.01, 1])
        .thresholds(amount)
        (volume.voxels);

    var x = d3.scaleLinear()
        .domain([.01, 1])
        .range([0, width])

    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([margin.bottom, height - margin.top]);

    var svg = d3.select("#tfContainer").append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", (event) => {
            if (!mouseDown) return;
            const mTop = margin.top;
            const density = event.offsetX / width;
            domainMesh.material.uniforms.iso_value.value = density;
            domainMesh.material.needsUpdate = true;
            paint();
            const el = document.getElementById("indicator")
            if (el)
                el.parentElement.removeChild(el);

            const group =
                svg.append("g")
                .attr("id", "indicator");
            group.append("circle")
                .attr("cx", event.offsetX)
                .attr("cy", event.offsetY)
                .attr("r", indicatorRadius)
                .attr("fill", "#ffffffaa")
            group.append("path")
                .attr("d", `M ${event.offsetX} ${event.offsetY - indicatorRadius / 2} V ${mTop}`)
                .attr("stroke", "#ffffffaa")
                .attr("stroke-width", 1);
        });

    svg.selectAll(".bar")
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0))
        .attr("y", margin.top)
        .attr("color", "white")
        .attr("width", (width / amount) - padding)
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .attr("height", d => y(d.length));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (margin.top) + ")")
        .attr("style", "user-select: none")
        .call(d3.axisTop(x));

    // Append the y-axis to the visualization
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));
}

function onClick(event) {}