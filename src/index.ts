import * as THREE from 'three';
import { Vector3 } from 'three';
import sdfLiquid from './shaders/oceanBowlSdf.frag.glsl';
import basicSdf from './shaders/sdf.vert.glsl';
import { OrbitControls } from 'three-stdlib';
import { inferNormal, raymarch } from './raymarching';
import { sdfScene } from './sdfScene.ts';

// Setup DOM

document.body.style.margin = '0';

const rootElement = document.querySelector<HTMLDivElement>('#root')!;

rootElement.style.display = 'flex';
rootElement.style.height = '100vh';
rootElement.style.width = '100vw';

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
});

const { width, height } = rootElement.getBoundingClientRect();

// Setup Renderer

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xfee2e2);

rootElement.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Setup Camera and Controls

const camera = new THREE.PerspectiveCamera(50.0, width / height);
camera.position.set(10, 8, 15);
camera.lookAt(0, 0, 0);

const orbitControls = new OrbitControls(camera, renderer.domElement);

const resizeObserver = new ResizeObserver(() => {
    const { width, height } = rootElement.getBoundingClientRect();
    renderer.setSize(width, height, true);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

resizeObserver.observe(rootElement);
// Add Light

const headlight = new THREE.PointLight();
headlight.position.set(10, 25, 10);
headlight.intensity = 400.0;

// Set up material, geometry and mesh for raymarching / sdf rendering:

const sdfMaterial = new THREE.RawShaderMaterial({
    vertexShader: basicSdf,
    fragmentShader: sdfLiquid,
    glslVersion: THREE.GLSL3,
    userData: {
        time: { value: 0.0 },
        bubbleAt: { value: new Vector3(0.0, 0.0, 0.0) },
        bubbleStartTime: { value: -1.0 },
        lightPosition: { value: new Vector3() },
    },
});
sdfMaterial.uniforms.time = sdfMaterial.userData.time;
sdfMaterial.uniforms.bubbleAt = sdfMaterial.userData.bubbleAt;
sdfMaterial.uniforms.bubbleStartTime = sdfMaterial.userData.bubbleStartTime;
sdfMaterial.uniforms.lightPosition = sdfMaterial.userData.lightPosition;
sdfMaterial.side = THREE.DoubleSide;

const boxGeometry = new THREE.BoxGeometry(10, 8, 10);
const boxMesh = new THREE.Mesh(boxGeometry, sdfMaterial);
scene.add(boxMesh);
scene.add(headlight);
boxMesh.frustumCulled = false;

// Add "classical" mesh to the scene that will interact with the raymarched scene

const boatMesh = new THREE.Mesh(
    new THREE.BoxGeometry().rotateZ(Math.PI / 3),
    new THREE.MeshLambertMaterial({
        color: 0xff0000,
    }),
);
boatMesh.frustumCulled = false;
boatMesh.position.set(0.1, 1.0, 0.1);
boatMesh.rotation.y = Math.PI / 8;
scene.add(boatMesh);

// Add event listener for "bubbles"

renderer.domElement.addEventListener('click', (event) => {
    // When a click occurs on the surface, start a bubble that floats upwards
    const time = performance.now();
    // Get ray direction from picked screen coord
    const rect = renderer.domElement.getBoundingClientRect();
    const x = event.clientX - rect.x;
    const y = event.clientY - rect.y;
    const viewportSize = renderer.getSize(new THREE.Vector2());
    const p = new THREE.Vector3(
        (x / viewportSize.x) * 2.0 - 1,
        -(y / viewportSize.y) * 2 + 1,
        -1.0,
    ).unproject(camera);
    const viewRay = p.clone().sub(camera.position);

    // Calculate surface position via raymarching;
    const surfacePosition = raymarch(sdfScene, camera.position, viewRay, time);
    if (surfacePosition === null) {
        return;
    }
    sdfMaterial.userData['bubbleAt'].value = surfacePosition;
    sdfMaterial.userData['bubbleStartTime'].value = performance.now();
    sdfMaterial.uniformsNeedUpdate = true;
});

const down = new THREE.Vector3(0, -1, 0);

function render() {
    orbitControls.update();
    const time = performance.now();

    // The "boat" is floating on the waves. Calculate its vertical position and orientation:
    const start = new THREE.Vector3(
        boatMesh.position.x,
        1000,
        boatMesh.position.z,
    );
    const surfacePosition = raymarch(sdfScene, start, down, time);

    if (surfacePosition !== null) {
        const n = inferNormal(sdfScene, surfacePosition, time);
        boatMesh.position.y = surfacePosition.y;
        boatMesh.lookAt(n.add(boatMesh.position));
    }

    // Update shader uniforms:
    sdfMaterial.userData.time.value = time;
    sdfMaterial.userData.lightPosition.value = headlight.position;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);
