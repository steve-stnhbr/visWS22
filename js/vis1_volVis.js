let renderer, camera, scene, controls, orbitCamera;
let canvasWidth, canvasHeight = 0;
let slider = null;
let container = null;
let frontFBO, backFBO = null;
let volume = null;
let fileInput = null;
let play = false;
let hist = null;

function init() {
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.8;
    canvasHeight = window.innerHeight * 0.8 - 200;

    let histogramElement = d3.select("#histogramContainer");
    hist = new HistogramSlider(window.innerWidth * 0.95, 100,
        ({top: 0, right: 10, bottom: 0, left: 0}), [0.0, 1.0],
        histogramElement, 100);


    // https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
    // https://threejs.org/docs/#examples/en/controls/OrbitControls


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


    let cube = new BoundingCube();

    frontFBO = new FBO(canvasWidth, canvasHeight, cube.getFrontMesh(volume.scale), camera, renderer);
    backFBO = new FBO(canvasWidth, canvasHeight, cube.getBackMesh(volume.scale), camera, renderer);

    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0,0,0), 2*volume.max, renderer.domElement);

    const volumeMesh = volume.getMesh(frontFBO, backFBO);
    scene.add(volumeMesh);

    hist.setData(volume.voxels, 0.2);

    paint();
}

function paint(){
    requestAnimationFrame(paint);

    orbitCamera.update();


    frontFBO.renderToTexture(renderer, camera);
    backFBO.renderToTexture(renderer, camera);

    //volume.setIso(iso);
    volume.setIso(hist.getSliderValue());

    renderer.render(scene, camera);
}

function playPause(){
    play = !play;
    orbitCamera.autoRotate = play;
    console.log("plause: " + play);
    if(play) paint();
}
