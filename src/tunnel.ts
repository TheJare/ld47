import * as THREE from "three";
import TorusKnotCurve from "./torus-knot-curve";

export default class Tunnel {
    public curve: TorusKnotCurve;
    mesh: THREE.Mesh;

    constructor(parentScene: THREE.Scene) {
        this.curve = new TorusKnotCurve(5, 7, 9);
        this.curve.arcLengthDivisions = 1000;
        this.curve.updateArcLengths();
        const geom = new THREE.TubeBufferGeometry(this.curve, 920, 0.2, 32, true);
        const mat = new THREE.MeshPhongMaterial({
            color: "#FFFFFF",
            flatShading: true,
            side: THREE.BackSide,
            // wireframe: true
        });
        this.mesh = new THREE.Mesh(geom, mat);
        parentScene.add(this.mesh);
    }
}