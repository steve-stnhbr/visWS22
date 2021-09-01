let renderer, camera, scene, controls, orbitCamera;
let canvasWidth, canvasHeight = 0;
let histogramWidth, histogramHeight = 0;
let histogramXRange, histogramYRange = [];
let slider = null;
let container = null;
let histogram = null;
let frontFBO, backFBO = null;
let volume = null;
let fileInput = null;
let play = false;
let svg = null;
let pointerX = 0;
let sliderX = 0;
let iso = 0;
let x, y = 0;
let numBins = 100;

let isInit = true;

function init() {
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.8;
    canvasHeight = window.innerHeight * 0.8 - 200;

    histogramWidth = window.innerWidth;
    histogramHeight = 100;
    let margin = ({top: 0, right: 10, bottom: 0, left: 0});
    histogramXRange = [margin.left, histogramWidth - margin.right];
    histogramYRange = [histogramHeight - margin.bottom, margin.top];

    svg = d3.select("#histogramContainer")
        .append("svg")
        .attr("width", histogramWidth)
        .attr("height", histogramHeight);

    let dummy = [];
    for(let i = 0; i < numBins; i++){
        dummy.push(i);
    }
    let bins = d3.bin().thresholds(numBins)(dummy);
    console.log(bins);

    histogram = svg.append("g")
        .selectAll("rect")
        .data(bins)
        .enter().append("rect");

    let sliderMargin = ({top: 0, right: 3, bottom: 0, left: 3});
    let sliderWidth = histogramWidth / numBins + sliderMargin.left + sliderMargin.right;
    let dragStarted = function(event){
        console.log("STARTED");
        d3.select(this).attr("stroke", "red");
        pointerX = event.x;
    }
    let dragStopped = function(){
        console.log("stopped");
        d3.select(this).attr("stroke", "black");
    }
    let dragging = function(event){
        console.log(event.x);
        console.log(histogramWidth);
        let xin = Math.min(Math.max(event.x, 0), histogramWidth - sliderWidth);
        let dx = xin - pointerX;
        pointerX = xin;
        sliderX += dx;
        d3.select(this).attr("x", sliderX);
        iso = x.invert(sliderX);
        console.log(iso);
    }

    let drag = d3.drag()
        .on("start", dragStarted)
        .on("drag", dragging)
        .on("end", dragStopped);

    slider = svg.append("rect")
        .attr("height", histogramHeight + sliderMargin.top + sliderMargin.bottom)
        .attr("width", sliderWidth)
        .attr("x", -sliderMargin.left)
        .attr("y", -sliderMargin.top)
        .attr('stroke-width', '5')
        .attr('stroke', 'gray')
        .attr("fill", "white")
        .attr("fill-opacity", 0.5)
        .call(drag);





    // https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
    // https://threejs.org/docs/#examples/en/controls/OrbitControls


    setIsoSlider(0.1);


    renderer = new THREE.WebGLRenderer();
    renderer.setSize( canvasWidth, canvasHeight );
    container.appendChild( renderer.domElement );

    // read and parse volume file
    fileInput = document.getElementById("upload");//,
    fileInput.addEventListener('change', readFile);



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

function resetVis(){

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 1000 );



    //console.log(renderer.domElement.getContext('webgl2'));


    let cube = new BoundingCube();
    //scene.add( cube.getBackMesh(volume.scale) );

    frontFBO = new FBO(canvasWidth, canvasHeight, cube.getFrontMesh(volume.scale), camera, renderer);
    backFBO = new FBO(canvasWidth, canvasHeight, cube.getBackMesh(volume.scale), camera, renderer);

    //camera.position.z = 2 * volume.max;


    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0,0,0), 2*volume.max, renderer.domElement);


    //const testCube = new THREE.BoxGeometry(100, 100, 100);
    //const testMaterial = new THREE.MeshBasicMaterial( { map: backFBO.renderTarget.texture } );
    //const testMesh = new THREE.Mesh(testCube, testMaterial);
    //scene.add(testMesh);

    const volumeMesh = volume.getMesh(frontFBO, backFBO);
    scene.add(volumeMesh);


    //controls = new THREE.OrbitControls( camera, renderer.domElement );
    //controls.autoRotate = play;

    createHistogram();
    paint();
}

function createHistogram(){
    let bins = d3.bin()
        .domain([0.0, 1.0])
        .thresholds(numBins)(volume.voxels);

    let max = d3.max(bins, d => d.length);
    let valueRange = [0, max];

    x = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range(histogramXRange);

    y = d3.scalePow()
        .exponent(0.2)
        .domain(valueRange).nice()
        .range(histogramYRange);

    let len = function(d){ return y(0) - y(d.length); }

    let color = d3.scalePow()
        .exponent(0.2)
        .domain(valueRange)
        .range(["#fee8c8", "#e34a33"])
        .interpolate(d3.interpolateHcl);

    // svg.selectAll("*").remove();
    //
    // histogram = svg.append("g")
    //     .selectAll("rect")
    //     .data(bins)
    //     .enter().append("rect");


    console.log(histogram.data(bins));

    histogram.data(bins)
        .join("rect")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => (y(0)-y(max)) / 2 - len(d)/2)
        .attr("height", d => len(d))
        .attr("fill", d => color(d.length));


    // let histogramHandler = histogram.data(bins);
    //
    // console.log(histogramHandler);
    // console.log(histogram);
    //
    // histogramHandler.enter().append("rect");
    //
    // histogramHandler.attr("x", d => x(d.x0) + 1)
    //     .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    //     .attr("y", d => (y(0)-y(max)) / 2 - len(d)/2)
    //     .attr("height", d => len(d))
    //     .attr("fill", "white");
    //
    // histogramHandler.exit().remove();


    // histogram.data(bins).exit().transition()
    //     .duration(300).remove();
    //
    //
    // let randomColor = "#"+ Math.floor(Math.random()*16777215).toString(16);
    //
    // histogram.data(bins).enter().append("rect")
    //     .attr("x", d => x(d.x0) + 1)
    //     .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    //     .attr("y", d => (y(0)-y(max)) / 2 - len(d)/2)
    //     .attr("height", d => len(d))
    //     .attr("fill", randomColor);
    //
    //
    //     histogram.data(bins)
    //         .transition().duration(500)
    //         .attr("x", d => x(d.x0) + 1)
    //         .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    //         .attr("y", d => (y(0)-y(max)) / 2 - len(d)/2)
    //         .attr("height", d => len(d))
    //         .attr("fill", randomColor);
    //         //.attr("fill", d => color(d.length));






    //histogram.data(bins).exit().remove();


    // svg.append("g")
    //     .selectAll("rect")
    //     .data(bins)
    //     .join("rect")
    //     .attr("x", d => x(d.x0) + 1)
    //     .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    //     .attr("y", d => y(d.length))
    //     .attr("height", d => y(0) - y(d.length))
    //    .attr("fill", d => color(d.length));
        // .on("mouseover", function(event, d) {
        //     d3.select(this).attr("fill", "red");
        // })
        // .on("mouseout", function(event, d){
        //     d3.select(this).attr("fill", "white");
        // });


    console.log(bins);
}

function paint(){
    requestAnimationFrame(paint);

    //controls.update();
    orbitCamera.update();


    frontFBO.renderToTexture(renderer, camera);
    backFBO.renderToTexture(renderer, camera);

    //let iso = getIsoSlider();
    //console.log(iso);
    volume.setIso(iso);

    renderer.render(scene, camera);
}

function playPause(){
    play = !play;
    //controls.autoRotate = play;
    orbitCamera.autoRotate = play;
    console.log("plause: " + play);
    if(play) paint();
}
