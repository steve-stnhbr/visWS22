// https://gamedevelopment.tutsplus.com/tutorials/quick-tip-how-to-render-to-a-texture-in-threejs--cms-25686
class FBO {
    constructor(width, height, mesh) {
        this.scene = new THREE.Scene();
        this.scene.add(mesh);

        this.renderTarget = new THREE.WebGLRenderTarget
        (
            width, height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter
            }
            );
    }

    renderToTexture(renderer, camera){
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.scene, camera);
        renderer.setRenderTarget(null);
    }
}