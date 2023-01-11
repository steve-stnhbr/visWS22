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
let indicatorPushed = false;
let clickedIndicator = null;

const margin = { top: 20, right: 15, bottom: 15, left: 0 };
const padding = 2;
const amount = 80;
const indicatorRadius = 10;
const colors = ["ffff00", "ff00ff"];

const renderModes = ["Maximum Intensity Projection", "First Hit Projection"];

class Indicator {
    xValue;
    yValue;
    density;
    color;
    opacity;
    index;
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
    setupDropdown();
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
        document.getElementById("renderModes").selectedIndex.toString(),
        indicators
    );

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

function setupDropdown() {
    d3.select("#tfContainer")
        .select('#renderModes')
        .on("change", onSelectChange)
        .selectAll("option")
        .data(renderModes)
        .enter()
        .append("option")
        .html(d => d);
}

function setupD3() {
    const histogramElement = document.getElementById("tfContainer");
    if (histogramElement.children[2])
        histogramElement.removeChild(histogramElement.children[2]);
    const width = histogramElement.offsetWidth,
        height = width * 3 / 4;


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
            // if mouse is not dragging, ignore
            if (!mouseDown) return;
            const density = event.offsetX / width;
            const opacity = event.offsetY / height;

            let ind = {
                xValue: Math.max(margin.left, Math.min(width - margin.right, event.offsetX)),
                yValue: Math.max(margin.top, Math.min(height - margin.bottom, event.offsetY)),
                color: new THREE.Vector3(1, 1, 1),
                density,
                opacity
            };


            if (clickedIndicator) {
                ind.color = clickedIndicator.color;
                ind.index = clickedIndicator.index;
                indicators[clickedIndicator.index] = ind;
            } else if (!indicatorPushed) {
                indicatorPushed = addIndicator(ind);
            } else {
                ind.index = indicators.length - 1;
                indicators[ind.index] = ind;
            }

            updateIndicators();

            d3.select("#indicator")
                .data(indicators)
                .enter()
            paint();
        })
        .on("mouseup", (event) => {
            if (!indicatorPushed) {
                const density = event.offsetX / width;
                const opacity = event.offsetY / height;
                addIndicator({
                    xValue: event.offsetX,
                    yValue: event.offsetY,
                    color: new THREE.Vector3(1, 1, 1),
                    density,
                    opacity
                });
                updateIndicators();
            }
            indicatorPushed = false;
            clickedIndicator = null;
        })
        .on("mousedown", () => {
            d3.select(".swatch-picker-wrapper")
                .attr("hidden", "");
        });
    svg.append("g")
        .attr("id", "indicator")
    svg.append("g")
        .attr("id", "bars");

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

    updateIndicators();
}

function updateIndicators() {
    d3.select("#indicator")
        .selectAll("g")
        .remove();

    const data = d3.select("#indicator")
        .selectAll("g")
        .data(indicators)
        .enter()
        .append("g")
        .attr("index", d => d.index);
    const circle = data.append("circle");
    circle.attr("cx", d => d.xValue)
        .attr("cy", d => d.yValue)
        .attr("r", indicatorRadius)
        .attr("fill", d => `${vectorToColor(d.color)}`)
        .on("mousedown", (event, d) => {
            clickedIndicator = d;
            updateIndicators();
        })
        .on("mouseup", (event, d) => {
            indicatorPushed = true;
            mouseDown = false;
            if (clickedIndicator === d) {
                console.log(d);
                clickedIndicator = null;
                showColorSelection(circle, d);
            }
            updateIndicators();
        })
    data.append("path")
        .attr("d", d => `M ${d.xValue} ${d.yValue - indicatorRadius / 2} V ${margin.top}`)
        .attr("stroke", d => `${vectorToColor(d.color)}`)
        .attr("stroke-width", 1);

    domainMesh.material.uniforms.indicators.value = shader.prepareIndicators(indicators);
    domainMesh.material.needsUpdate = true;
    paint();
}

function addIndicator(indicator) {
    if (indicators.length >= 5) {
        console.error("There can only be 5 indicators");
        return false;
    }
    indicator.index = indicators.length;
    indicators.push(indicator);
    return true;
}


function vectorToColor(vec) {
    return `rgb(${vec.x * 255}, ${vec.y * 255}, ${vec.z * 255})`;
}

function showColorSelection(circle, data) {
    const wrapper = d3.select(".swatch-picker-wrapper")
        .attr("hidden", null);
    const picker = wrapper
        .select(".swatch-picker")
    picker.attr("style", `top: ${data.yValue}px; left: ${data.xValue}px`)
    picker.select(".close")
        .on("click", () => wrapper.attr("hidden", ""))
    picker.select(".remove")
        .on("click", () => {
            indicators.forEach((val, index) => {
                if (index > data.index) {
                    val.index = val.index - 1;
                }
            });
            indicators.splice(data.index, 1);
            console.log(indicators);
            wrapper.attr("hidden", "")
            updateIndicators();
        });
    picker.selectAll("span")
        .on("click", (event) => {
            indicators[data.index].color = colorToVector(event.currentTarget.style.backgroundColor);
            updateIndicators();
        })
}

function colorToVector(col) {
    const regex = /rgb\(([0-9]{1,3}), ?([0-9]{1,3}), ?([0-9]{1,3})\)/;
    const matches = col.match(regex);
    return new THREE.Vector3(
        parseInt(matches[1]) / 255,
        parseInt(matches[2]) / 255,
        parseInt(matches[3]) / 255
    );
}

function onSelectChange(event) {
    domainMesh.material.uniforms["render_mode"].value = event.target.selectedIndex.toString();
    domainMesh.material.needsUpdate = true;
    paint();
}