let renderer, camera, scene, controls;
let canvasWidth, canvasHeight = 0;
let container = null;
let frontFBO, backFBO = null;
let volume = null;

function init() {
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.8;
    canvasHeight = window.innerHeight * 0.8 - 50;

    // https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
    // https://threejs.org/docs/#examples/en/controls/OrbitControls


    setIsoSlider(0.1);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 1000 );

    // read and parse volume file
    let fileInput = document.getElementById("upload"),
        readFile = function () {

            let reader = new FileReader();
            reader.onloadend = function () {
                console.log("data loaded: ");

                let data = new Uint16Array(reader.result);
                volume = new Volume(data);

                resetVis();
            };
            reader.readAsArrayBuffer(fileInput.files[0]);
        };
    fileInput.addEventListener('change', readFile);


}

function resetVis(){

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( canvasWidth, canvasHeight );
    container.appendChild( renderer.domElement );

    //console.log(renderer.domElement.getContext('webgl2'));


    const cube = new BoundingCube();
    //scene.add( cube.getBackMesh(volume.scale) );

    frontFBO = new FBO(canvasWidth, canvasHeight, cube.getFrontMesh(volume.scale), camera, renderer);
    backFBO = new FBO(canvasWidth, canvasHeight, cube.getBackMesh(volume.scale), camera, renderer);


    camera.position.z = 2 * volume.max;


    const testCube = new THREE.BoxGeometry(100, 100, 100);
    const testMaterial = new THREE.MeshBasicMaterial( { map: backFBO.renderTarget.texture } );
    const testMesh = new THREE.Mesh(testCube, testMaterial);
    //scene.add(testMesh);

    const volumeMesh = volume.getMesh(frontFBO, backFBO);
    scene.add(volumeMesh);


    controls = new THREE.OrbitControls( camera, renderer.domElement );

    paint();
}

function paint(){
    requestAnimationFrame(paint);

    controls.update();

    frontFBO.renderToTexture(renderer, camera);
    backFBO.renderToTexture(renderer, camera);

    let iso = getIsoSlider();
    console.log(iso);
    volume.setIso(iso);

    renderer.render(scene, camera);
}

