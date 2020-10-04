import * as THREE from "three";
import { Vector3 } from "three";

import Tunnel from "./tunnel";

export default class Game {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private screenSize: THREE.Vector2 = new THREE.Vector2();

    private menuUIel: HTMLElement;
    private ingameUIel: HTMLElement;
    private scoreUIel: HTMLElement;
    private hiscoreUIel: HTMLElement;

    private playing: boolean = false;

    private player: THREE.Mesh;
    private playerRot: number = 0;
    private score: number;
    private highScore: number = 0;

    private tunnel: Tunnel;
    private tpos: number;
    private speed: number = 0;

    private enemyMesh: THREE.BufferGeometry;
    private enemyMat: THREE.Material;
    private obstacles: THREE.Mesh[];
    private newObstacleTimer: number;

    constructor(canvasElem: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasElem,
            antialias: true,
        });
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.camera.position.z = 15;
        this.scene = new THREE.Scene();

        this.menuUIel = document.getElementById("menu-ui");
        this.ingameUIel = document.getElementById("ingame-ui");
        this.scoreUIel = document.getElementById("score-text");
        this.hiscoreUIel = document.getElementById("hiscore-text");

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
        this.tunnel.setMaterial(true);

        const geom = new THREE.SphereBufferGeometry(0.05, 32, 32);
        const mat = new THREE.MeshPhongMaterial({
            color: "#FFFFFF",
        });
        this.player = new THREE.Mesh(geom, mat);

        this.enemyMesh = new THREE.SphereBufferGeometry(0.03, 6, 6);
        this.enemyMat = new THREE.MeshLambertMaterial({
            color: "#ff00ff",
        });

        this.obstacles = [];

        this.setPlaying(false);
    }

    private reset() {
        this.scene.add(this.player);
        this.score = 0;

        // Init tunnel ride
        this.newObstacleTimer = 0;
        this.setPlaying(true);

        // Add some obstacles
        for (let i = 0; i < 10; i++) {
            this.AddObstacle();
        }
    }

    public gameOver() {
        this.scene.remove(this.player);
        this.scene.remove(...this.obstacles);
        this.obstacles = [];
        this.highScore = Math.max(this.highScore, this.score);
        this.hiscoreUIel.innerText = Math.floor(this.highScore).toString();
        this.setPlaying(false);
    }

    private setPlaying(playing: boolean) {
        this.playing = playing
        this.tpos = Math.random();
        this.speed = 0;
        this.tunnel.setMaterial(!playing);
        this.menuUIel.style.display = playing? "none" : "flex";
        this.ingameUIel.style.display = playing? "flex" : "none";
        this.setTunnelPos(this.tpos);
    }

    public onWindowResize(w: number, h: number): void {
        this.screenSize.set(w, h);
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    }

    public onMouseMove(x: number, y: number): void {
        x = x / this.screenSize.x - 0.5;
        y = y / this.screenSize.y - 0.5;
        this.playerRot = Math.atan2(y, x);
    }

    public onClick(x: number, y: number): void {
        if (!this.playing) {
            this.reset();
            this.onMouseMove(x, y);
        }
    }

    private AddObstacle() {
        // Select a point on the curve
        // Choose one not in immediate sight (further than 0.1 before and after current pos)
        let t = (Math.random()*0.8 + 0.1 + this.tpos) % 1;

        let pos = this.tunnel.curve.getPoint(t);
        let dir = this.tunnel.curve.getTangent(t);
        let a = Math.random() * Math.PI * 2;

        // Random vector perpendicular to the direction (tangent)
        // to place the obstacle on the edge
        let axis: Vector3;
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
            axis = new Vector3(-dir.z, 0, dir.x);
        } else {
            axis = new Vector3(0, -dir.z, dir.y);
        }
        axis = axis.normalize().applyAxisAngle(dir, a).multiplyScalar(0.185);

        let mesh = new THREE.Mesh(this.enemyMesh, this.enemyMat);
        this.scene.add(mesh);
        mesh.position.copy(pos.add(axis));
        this.obstacles.push(mesh);
    }

    private checkObstacles(): boolean {
        let crashed = false;
        let d = this.player.position;
        let r = 0.02*0.02 + 0.05*0.05;
        for (let i = this.obstacles.length-1; i >= 0; i--) {
            let o = this.obstacles[i];
            if (d.distanceToSquared(o.position) < r) {
                crashed = true;
                this.scene.remove(o);
                this.obstacles.splice(i, 1);
                break;
            }
        }
        return crashed;
    }

    private setTunnelPos(tpos: number) {
        const e = this.camera.matrixWorld.elements;
        let up = new Vector3(e[4], e[5], e[6]).normalize();
        // LookAt by default uses the default world up vector.
        // This causes the camera to swing wildly when switching
        // We want the camera to keep its own up axis as constant as possible
        this.camera.position.copy(this.tunnel.curve.getPointAt(tpos));
        this.camera.up = up;
        this.camera.lookAt(this.tunnel.curve.getPointAt((tpos+0.001) % 1));
        this.camera.updateWorldMatrix(true, false);

        // Similar for the player, just a little bit ahead of the camera
        // Uses the up vector from the camera so we can use mouse coordinates as if they were camera coords
        const ppos = this.tunnel.curve.getUtoTmapping((tpos + 0.002) % 1, 0);
        let playerRotCenter = this.tunnel.curve.getPoint(ppos);
        let playerDirection = this.tunnel.curve.getTangent(ppos);

        let right = new Vector3().crossVectors(playerDirection, up);
        right.applyAxisAngle(playerDirection, this.playerRot);
        this.player.position.copy(right.multiplyScalar(0.2).add(playerRotCenter));
    }

    public update(dt: number): void {
        this.tpos = (this.tpos + dt * this.speed) % 1;
        this.speed = Math.min(0.01, this.speed + dt*0.001);

        if (this.playing) {
            this.newObstacleTimer += dt;
            while (this.newObstacleTimer >= 0.2) {
                this.newObstacleTimer -= 0.2;
                this.AddObstacle();
            }
            if (this.checkObstacles()) {
                this.speed = 0;
                this.gameOver();
            }
            this.score += dt;
            this.scoreUIel.innerText = Math.floor(this.score).toString();
        }
        this.setTunnelPos(this.tpos);
        this.renderer.render(this.scene, this.camera);
    }
}