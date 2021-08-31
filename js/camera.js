class OrbitCamera {
    constructor(camera, targetPos, radius, domElement){
        console.log("OrbitCamera");

        this.camera = camera;
        this.targetPos = targetPos;
        this.camera.lookAt(this.targetPos);
        this.radius = radius;
        this.maxRadius = radius * 2;
        this.phi = 0;
        this.theta = 0;

        console.log(this.targetPos);

        //this.quaternion = new THREE.Quaternion();

        this.pointerPos = new THREE.Vector2(0, 0);
        this.drag = false;

        this.autoRotate= false;

        this.domElement = domElement;
        this.domElement.addEventListener('pointerdown', event => this.onMouseDown(event), false);
        this.domElement.addEventListener('pointerup', event => this.onMouseUp(event), false);
        this.domElement.addEventListener('pointermove', event => this.onMouseMove(event), false);
        this.domElement.addEventListener('wheel', event => this.onMouseWheel(event), false);
        // catch mouse-up outside the browser window
        window.addEventListener('pointerup', event => this.onMouseUp(event));

        //this.camera.lookAt(this.targetPos);
        this.camera.up.set(0, 0, -1);
        this.updateCamera(0, 0, 0);
    }

    update(){
        if(this.autoRotate){
            this.updateCamera(0.5, 0, 0);
        }
    }


    updateCamera(dx, dy, dz){
        console.log(dx + ", " + dy + ", " + dz);

        //let rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(dy, dx, 0), Math.PI / 1000.0);
        //this.quaternion.multiply(rotation);
        //this.camera.applyQuaternion(rotation);
        //this.camera.quaternion.normalize();
        //let cameraPosition = new THREE.Vector3();
        //this.camera.getWorldPosition(cameraPosition);
        //let targetDistance = cameraPosition.length();
        //this.camera.translateOnAxis(cameraPosition.negate().normalize(), targetDistance);
        //console.log(cameraPosition);
        //let angle = new THREE.Vector2(dx, dy).length() / 100.0;
        this.phi += dx / 100.0;
        this.theta += dy / 100.0;
        this.radius += dz / 30.0;

        console.log("phi: " + this.phi + ", theta: " + this.theta + ", radius: " + this.radius);
        //let rotationVector = new THREE.Vector3(dy, dx, 0);
        //let rotationMagnitude = rotationVector.length();
        //this.camera.rotateOnAxis(rotationVector.normalize(), rotationMagnitude * Math.PI / 1000.0);
        //this.camera.translateOnAxis(cameraPosition.normalize(), targetDistance);

        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
        //this.phi = clamp(this.phi, -Math.PI, Math.PI);
        this.theta = clamp(this.theta, -Math.PI / 2.0, Math.PI / 2.0);
        this.radius = clamp(this.radius, 0, this.maxRadius);


        console.log(this.theta);

        //this.camera.position.x = this.radius * Math.cos(this.yaw);
        //this.camera.position.z = this.radius * Math.sin(this.yaw);
        ////this.camera.position.y = this.radius * Math.sin(this.pitch);


        // somehow works combined...
        //this.camera.position.x = -this.radius * Math.sin(this.phi) * Math.cos(this.theta);
        //this.camera.position.z = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        //this.camera.position.y = -this.radius * Math.cos(this.phi);

        // horizontal works
        // this.theta = 0;
        // this.camera.position.x = -this.radius * Math.sin(this.phi) * Math.cos(this.theta);
        // this.camera.position.y = -this.radius * Math.cos(this.theta) * Math.cos(this.phi);

        // vertical works
        //this.camera.position.z = this.radius * Math.sin(this.theta);
        //this.camera.position.y = -this.radius * Math.cos(this.theta);

        // works combined....
        this.camera.position.x = -this.radius * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.position.y = -this.radius * Math.cos(this.theta) * Math.cos(this.phi);
        this.camera.position.z = this.radius * Math.sin(this.theta);


        this.camera.lookAt(this.targetPos);
        //this.camera.up.set(0, 0, -1);





        console.log(camera);
    }

    onMouseDown(event){
        event.preventDefault(); // no scrolling!
        console.log("MOUSE DOWN");
        let that = this;

        switch(event.button){
            case 0:
                that.drag = true;
                console.log(event);
                console.log(that.pointerPos);

                that.pointerPos.x = event.clientX;
                that.pointerPos.y = event.clientY;
                console.log(that.pointerPos);
                console.log("left mouse");

                break;
        }
    }

    onMouseUp(event){
        console.log("MOUSE UP");
        switch(event.button){
            case 0:
                this.drag = false;
                break;
        }
    }

    onMouseMove(event){
        let that = this;
        if(this.drag){
            console.log("previous pointer position: ");
            console.log(that.pointerPos);
            let newPointerPos = new THREE.Vector2(event.clientX, event.clientY);
            let pointerDiff = new THREE.Vector2().subVectors(that.pointerPos, newPointerPos);
            that.pointerPos = newPointerPos;
            console.log("diff: ");
            console.log(pointerDiff);
            that.updateCamera(pointerDiff.x, pointerDiff.y, 0);
        }

    }

    onMouseWheel(event){
        event.preventDefault();
        console.log("wheel");
        console.log(event);
        this.updateCamera(0, 0, -event.wheelDelta);
    }
}