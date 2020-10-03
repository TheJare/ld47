import * as THREE from "three";

export default class TorusKnotCurve extends THREE.Curve<THREE.Vector3> {

    constructor(private radius: number, private p: number, private q: number) {
        super();
    }

    // Stolen from TorusKnotBufferGeometry ofc
    getPoint(t: number, optionalTarget?: THREE.Vector3): THREE.Vector3 {

        let ct = t * this.p * Math.PI * 2;

        const cu = Math.cos(ct);
        const su = Math.sin(ct);
        const quOverP = this.q / this.p * ct;
        const cs = Math.cos(quOverP);

        optionalTarget = optionalTarget ?? new THREE.Vector3();
        optionalTarget.set(
            this.radius * (2 + cs) * 0.5 * cu,
            this.radius * (2 + cs) * su * 0.5,
            this.radius * Math.sin(quOverP) * 0.5
        );
        return optionalTarget;
    }
}