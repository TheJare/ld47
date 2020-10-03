import * as THREE from "three";
import { Vector3 } from "three";

import Tunnel from "./tunnel";

export default class View {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    private player: THREE.Mesh;
    private playerRot: number;

    private tunnel: Tunnel;
    private tpos: number;

    constructor(canvasElem: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasElem,
            antialias: true,
        });
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.camera.position.z = 15;
        this.scene = new THREE.Scene();

        // Set initial sizes
        this.onWindowResize(window.innerWidth, window.innerHeight);

        // Lights
        let light = new THREE.DirectionalLight(0xff0000);
        light.position.set(0, -1, 1);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0x00ffff);
        light.position.set(-1, 1, 0);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0x00ff00);
        light.position.set(1, 0, -1);
        this.scene.add(light);

        // Objects
        this.tunnel = new Tunnel(this.scene);

        {
            const geom = new THREE.SphereBufferGeometry(0.05, 32, 32);
            const mat = new THREE.MeshPhongMaterial({
                color: "#FFFFFF",
            });
            this.player = new THREE.Mesh(geom, mat);
            this.scene.add(this.player);
            this.playerRot = 0;
        }

        // Init tunnel ride
        this.tpos = 0;
        this.setCameraPos(this.tpos);
    }

    public onWindowResize(w: number, h: number): void {
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    private setCameraPos(tpos: number) {
        this.camera.position.copy(this.tunnel.curve.getPointAt(tpos));
        // LookAt by default uses the default world up vector.
        // This causes the camera to swing wildly when switching
        // We want the camera to keep its own up axis as constant as possible
        {
            const e = this.camera.matrixWorld.elements;
            this.camera.up = new Vector3(e[4], e[5], e[6]).normalize();
            this.camera.lookAt(this.tunnel.curve.getPointAt((tpos+0.001) % 1));
            this.camera.updateWorldMatrix(true, false);
        }
        // Similar for the player, just a little bit ahead of the camera
        {
            const ppos = this.tunnel.curve.getUtoTmapping((tpos + 0.002) % 1, 0);
            let playerRotCenter = this.tunnel.curve.getPoint(ppos);

            this.player.position.copy(playerRotCenter);

            const e = this.player.matrixWorld.elements;
            let up = new Vector3(e[4], e[5], e[6]).normalize();
            this.player.up = up;
            this.player.lookAt(this.tunnel.curve.getPointAt((tpos + 0.003) % 1));
            let playerDirection = this.tunnel.curve.getTangent(ppos);
            up.applyAxisAngle(playerDirection, this.playerRot);
            this.player.position.copy(up.multiplyScalar(0.2).add(playerRotCenter));
        }

    }

    public update(dt: number): void {
        this.tpos = (this.tpos + dt*0.02) % 1;
        this.playerRot += dt*1.2;
        this.setCameraPos(this.tpos);
        this.renderer.render(this.scene, this.camera);
    }
}