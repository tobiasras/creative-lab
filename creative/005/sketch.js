import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let paused = false;

const container = document.getElementById('sketch-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.5,
    100
);
camera.position.set(0, 0, 55);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;

controls.dampingFactor = 0.05;

controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
};
controls.enablePan = false

function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}
window.addEventListener('resize', resize);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resize);
}

const row = 8;
const spacing = 5;
const offset = (row - 1) * spacing / 2;
const pos = [];
for (let x = 0; x < row; x++) {
    for (let y = 0; y < row; y++) {
        for (let z = 0; z < row; z++) {

            pos.push(
                x * spacing - offset,
                y * spacing - offset,
                z * spacing - offset
            );
        }
    }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(pos, 3)
);

const material = new THREE.PointsMaterial({
    color: 0x000000,
    size: 0.5,
    sizeAttenuation: true
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);



const positions = geometry.attributes.position.array;




const env = {
    gravity: 1.55,
    orbs: new Array(row * row * row).fill().map((_, i) => {
        return {
            x: positions[i * 3],
            y: positions[i * 3 + 1],
            z: positions[i * 3 + 2],
            mass: Math.random() * 1 + 0.5,
            velocity_x: 0,
            velocity_y: 0,
            velocity_z:0,
        }
    })
}

function calc_force(orb_1, orb_2) {
    const dx = orb_2.x - orb_1.x;
    const dy = orb_2.y - orb_1.y;
    const dz = orb_2.z - orb_1.z;

    const r2 = dx * dx + dy * dy + dz * dz;
    const r = Math.sqrt(r2);

    if (r < 1e-6) {
        return { Fx: 0, Fy: 0, Fz: 0 };
    }

    const eps = 1;
    const F = env.gravity * orb_2.mass * orb_1.mass / (r2 + eps * eps);


    return {
        Fx: F * dx / r,
        Fy: F * dy / r,
        Fz: F * dz / r
    };
}

const max_distance = 5;



function compute_force() {
    for (const orb of env.orbs) {
        orb.force_x = 0;
        orb.force_y = 0;
        orb.force_z = 0;
    }

    for (let i = 0; i < env.orbs.length; i++) {
        for (let j = i + 1; j < env.orbs.length; j++) {
            let orb_i = env.orbs[i]
            let orb_j = env.orbs[j]

            const distance = Math.sqrt((orb_i.x - orb_j.x) ** 2 + (orb_i.y - orb_j.y) ** 2 + (orb_i.z - orb_j.z) ** 2);

            if (distance > max_distance) {
                continue;
            } else {
                const { Fx, Fy, Fz } = calc_force(orb_i, orb_j)
            
                env.orbs[i].force_x += Fx;
                env.orbs[i].force_y += Fy;
                env.orbs[i].force_z += Fz;

                env.orbs[j].force_x -= Fx;
                env.orbs[j].force_y -= Fy;
                env.orbs[j].force_z -= Fz;
            }
        }
    }
}
            
function update(dt) {
    compute_force();
    update_orbs(dt);
}

function update_orbs(dt) {
    // Update motion
    for (const orb of env.orbs) {
        orb.accelerations_x = orb.force_x / orb.mass;
        orb.accelerations_y = orb.force_y / orb.mass;
        orb.accelerations_z = orb.force_z / orb.mass;
        
        orb.velocity_x += orb.accelerations_x * dt;
        orb.velocity_y += orb.accelerations_y * dt;
        orb.velocity_z += orb.accelerations_z * dt;

        orb.x += orb.velocity_x * dt;
        orb.y += orb.velocity_y * dt;
        orb.z += orb.velocity_z * dt;

        positions[env.orbs.indexOf(orb) * 3] = orb.x;       
        positions[env.orbs.indexOf(orb) * 3 + 1] = orb.y;
        positions[env.orbs.indexOf(orb) * 3 + 2] = orb.z;
    }
}


const tempColor = new THREE.Color();

function getColor(x, y, z) {

    const radius = Math.sqrt(x*x + y*y + z*z);
    const t = Math.min(radius / 35, 1);

    // Rainbow based on distance from origin
    tempColor.setHSL(0.7 * (0 - t), 1.0, 0.5);

    return tempColor;
}


function updateLines() {

    const positions = lineGeometry.attributes.position.array;
    const colors = lineGeometry.attributes.color.array;

    let index = 0;

    for (let i = 0; i < env.orbs.length; i++) {

        const a = env.orbs[i];

        for (let j = i + 1; j < env.orbs.length; j++) {

            const b = env.orbs[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dz = b.z - a.z;

            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq > maxDistSq)
                continue;

            // positions
            positions[index]     = a.x;
            positions[index + 1] = a.y;
            positions[index + 2] = a.z;

            positions[index + 3] = b.x;
            positions[index + 4] = b.y;
            positions[index + 5] = b.z;

            // color for first endpoint
            let c = getColor(a.x, a.y, a.z);

            colors[index]     = c.r;
            colors[index + 1] = c.g;
            colors[index + 2] = c.b;

            // color for second endpoint
            c = getColor(b.x, b.y, b.z);

            colors[index + 3] = c.r;
            colors[index + 4] = c.g;
            colors[index + 5] = c.b;

            index += 6;
        }
    }

    lineGeometry.setDrawRange(0, index / 3);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;
}



const maxDistance = 8.0;
const maxDistSq = maxDistance * maxDistance;

const MAX_CONNECTIONS = env.orbs.length * (env.orbs.length - 1) / 2;

const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
const lineColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);

const lineGeometry = new THREE.BufferGeometry();

lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
);

lineGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(lineColors, 3)
);

const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.7
});

const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);




lineGeometry.setDrawRange(0, 0);

scene.fog = new THREE.Fog(0x000000, 15, 100);


const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    update(dt);
    updateLines();


    geometry.attributes.position.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
}

animate();
