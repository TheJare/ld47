import * as THREE from "three";
import TorusKnotCurve from "./torus-knot-curve";

export default class Tunnel {
    public curve: TorusKnotCurve;
    mesh: THREE.Mesh;
    wireMat: THREE.Material;
    flatMat: THREE.Material;

    constructor(parentScene: THREE.Scene) {
        this.curve = new TorusKnotCurve(5, 7, 9);
        this.curve.arcLengthDivisions = 1000;
        this.curve.updateArcLengths();
        const geom = new THREE.TubeBufferGeometry(this.curve, 920, 0.2, 32, true);
        this.flatMat = new THREE.MeshPhongMaterial({
            color: "#FFFFFF",
            flatShading: true,
            side: THREE.BackSide,
            // wireframe: true
        });
        this.wireMat = new THREE.MeshBasicMaterial({
            color: "#FFFFFF",
            side: THREE.BackSide,
            wireframe: true
        });
        this.mesh = new THREE.Mesh(geom, this.wireMat);
        parentScene.add(this.mesh);
    }

    public setMaterial(wire: boolean) {
        this.mesh.material = wire? this.wireMat : this.flatMat;
    }
}