let renderer, camera, scene, controls, orbitCamera;
let canvasWidth, canvasHeight = 0;
let container = null;
let frontFBO, backFBO = null;
let volume = null;
let fileInput = null;
let play = false;

function init() {
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.8;
    canvasHeight = window.innerHeight * 0.8 - 200;

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
    console.log(d3);
    let bins = d3.bin().thresholds(200)(volume.voxels);
    let width = window.innerWidth;
    let height = 100;

    let margin = ({top: 0, right: 10, bottom: 0, left: 0})

    let x = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([margin.left, width - margin.right]);

    let y = d3.scalePow()
        .exponent(0.2)
        .domain([0, d3.max(bins, d => d.length)]).nice()
        .range([height - margin.bottom, margin.top]);

    let svg = d3.select("#histogramContainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    bins.forEach(b => console.log(y(b.length)));

    svg.append("g")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", "white")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "red");
        })
        .on("mouseout", function(event, d){
            d3.select(this).attr("fill", "white");
        });


    console.log(bins);
}

function paint(){
    requestAnimationFrame(paint);

    //controls.update();
    orbitCamera.update();


    frontFBO.renderToTexture(renderer, camera);
    backFBO.renderToTexture(renderer, camera);

    let iso = getIsoSlider();
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
