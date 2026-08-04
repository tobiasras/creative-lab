import {OrbitControls} from "three/addons/controls/OrbitControls";
import * as THREE from "three";

export const scene = new THREE.Scene();
scene.background = new THREE.Color("#171616");

//scene.background = new THREE.Color("#171616"); // Dark gray, for example
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

function threeJsSetup() {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 0);
    camera.position.z = 5;
    controls.update();
    controls.mouseButtons = {
        RIGHT: THREE.MOUSE.ROTATE
    }
    controls.enablePan = false;
    controls.maxDistance = 25;
    return controls;
}


const controls = threeJsSetup();

const FACE_CAMERA_VIEWS = {
    1: {position: [0, 0, 5], target: [0, 0, 0]},
    2: {position: [0, 5, 0], target: [0, 0, 0]},
    3: {position: [5, 0, 0], target: [0, 0, 0]},
    4: {position: [-5, 0, 0], target: [0, 0, 0]},
    5: {position: [0, -5, 0], target: [0, 0, 0]},
    6: {position: [0, 0, -5], target: [0, 0, 0]},
};

export function focusCameraOnSide(sideNumber) {
    const view = FACE_CAMERA_VIEWS[sideNumber];
    if (!view) {
        return;
    }

    camera.position.set(view.position[0], view.position[1], view.position[2]);
    controls.target.set(view.target[0], view.target[1], view.target[2]);
    controls.update();
}


export function animateLoop() {



    requestAnimationFrame(animateLoop);
    controls.update();
    renderer.render(scene, camera);
}


const mouse = new THREE.Vector2();
const rayCaster = new THREE.Raycaster();

export function retrieveTileOnClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    rayCaster.setFromCamera(mouse, camera)
    const intersects = rayCaster.intersectObjects(scene.children, true)

    for (const hit of intersects) {
        const name = hit.object.name
        if (name && (name.startsWith('$:') || /^\d+_\d+_\d+$/.test(name))) {
            return hit
        }
    }

    return null
}