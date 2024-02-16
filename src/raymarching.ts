import * as THREE from 'three';

const e = 0.001;
const x_e = new THREE.Vector3(e, 0, 0);
const y_e = new THREE.Vector3(0, e, 0);
const z_e = new THREE.Vector3(0, 0, e);

export function inferNormal(
    sdfSceneFn: (position: THREE.Vector3, time: number) => number,
    surfacePosition: THREE.Vector3,
    time: number,
) {
    return new THREE.Vector3(
        sdfSceneFn(surfacePosition.clone().add(x_e), time),
        sdfSceneFn(surfacePosition.clone().add(y_e), time),
        sdfSceneFn(surfacePosition.clone().add(z_e), time),
    )
        .sub(
            new THREE.Vector3(
                sdfSceneFn(surfacePosition.clone().sub(x_e), time),
                sdfSceneFn(surfacePosition.clone().sub(y_e), time),
                sdfSceneFn(surfacePosition.clone().sub(z_e), time),
            ),
        )
        .normalize();
}

export function raymarch(
    sdfSceneFn: (position: THREE.Vector3, time: number) => number,
    start: THREE.Vector3,
    viewRay: THREE.Vector3,
    time: number,
): THREE.Vector3 | null {
    let depth = viewRay.length();
    const viewRayDirection = viewRay.clone().normalize();
    let success = false;
    for (let i = 0; i < 1000; i++) {
        const dist = sdfSceneFn(
            start.clone().add(viewRayDirection.clone().multiplyScalar(depth)),
            time,
        );
        if (dist < 0.001) {
            success = true;
            break;
        }
        depth += dist;

        if (depth >= 1337.0) {
            break;
        }
    }
    if (!success) {
        return null;
    }
    return start.clone().add(viewRayDirection.multiplyScalar(depth));
}
