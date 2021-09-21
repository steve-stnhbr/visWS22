let renderer, camera, scene, controls, orbitCamera;
let canvasWidth, canvasHeight = 0;
let slider = null;
let container = null;
let frontFBO, backFBO = null;
let volume = null;
let fileInput = null;
let play = false;
let hist = null;
let tf = null;
let testShader = null;

function init() {
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.7;
    canvasHeight = window.innerHeight * 0.7;

    let transferFunctionElement = d3.select("#tfContainer");
    tf = new TransferFunction(window.innerWidth * 0.3, window.innerHeight * 0.7,
        transferFunctionElement, 3, 40);

    // https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
    // https://threejs.org/docs/#examples/en/controls/OrbitControls


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

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 1000 );

    /* Keep this block for dummy scene given to students */
    const testCube = new THREE.BoxGeometry(100, 100, 100);
    const testMaterial = testShader.material;
    await testShader.load();
    const testMesh = new THREE.Mesh(testCube, testMaterial);
    //scene.add(testMesh);
    /* end dummy scene */

    let cube = new BoundingCube();

    let frontMesh = await cube.getFrontMesh(volume.scale);
    let backMesh = await cube.getBackMesh(volume.scale);

    frontFBO = new FBO(canvasWidth, canvasHeight, frontMesh, camera, renderer);
    backFBO = new FBO(canvasWidth, canvasHeight, backMesh, camera, renderer);

    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0,0,0), 2*volume.max, renderer.domElement);

    const volumeMesh = await volume.getMesh(frontFBO, backFBO);
    scene.add(volumeMesh);

    tf.setHistogramData(volume.voxels, 0.25);

    requestAnimationFrame(paint);
}

function paint(){

    if (!volume) return;

    orbitCamera.update();

    frontFBO.renderToTexture(renderer, camera);
    backFBO.renderToTexture(renderer, camera);

    renderer.render(scene, camera);
}

function playPause(){
    play = !play;
    orbitCamera.autoRotate = play;
    console.log("plause: " + play);
    if(play) requestAnimationFrame(paint);
}
