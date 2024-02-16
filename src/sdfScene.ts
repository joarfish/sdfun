import * as THREE from 'three';

function intersect(a: number, b: number) {
    return Math.max(a, b);
}

function sdfEllipsoid(p: THREE.Vector3, pos: THREE.Vector3, r: THREE.Vector3) {
    const k0 = p.clone().sub(pos).divide(r).length();
    const k1 = p.clone().sub(pos).divide(r.clone().multiply(r)).length();
    return (k0 * (k0 - 1.0)) / k1;
}

function sdfInnerBowl(p: THREE.Vector3) {
    return sdfEllipsoid(
        p,
        new THREE.Vector3(0.0, 0.0, 0.0),
        new THREE.Vector3(4.0, 4.0, 4.0),
    );
}

function sdfGersner(position: THREE.Vector3, time: number) {
    const wavelength = 4.2;
    const speed = 0.0015;
    const amplitude = 0.25;
    const k = (2.0 * Math.PI) / wavelength;
    const f = k * (position.z * 0.2 + position.x * 0.8 - speed * time);
    return amplitude * Math.cos(f) + amplitude * Math.sin(f) + position.y;
}

export function sdfScene(position: THREE.Vector3, time: number): number {
    return intersect(sdfGersner(position, time), sdfInnerBowl(position));
}
