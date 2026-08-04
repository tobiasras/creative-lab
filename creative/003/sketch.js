let shaderProgram;
let frameCounter = 0;


const env = {
    params: {
        repel_orb_count:700,
    },
    orbs: [],
    gravity: 1,
    center_strenth: 0,
    canvas: {
        w: 0,
        h: 0
    }
};




function preload() {
    shaderProgram = loadShader('shader.vert', 'shader.frag');
}

function canvasSize() {
    return [windowWidth, windowHeight];
}

function setup() {
    pixelDensity(1);

    const [w, h] = canvasSize();
    env.canvas.h = h
    env.canvas.w = w

    const canvas = createCanvas(w, h, WEBGL);
    canvas.parent('sketch-container');
    noStroke();

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onViewportChange);
    }

    init();
}

function onViewportChange() {
    resizeCanvasToFit();
}

function resizeCanvasToFit() {
    const [w, h] = canvasSize();

    env.canvas.h = h
    env.canvas.w = w


    resizeCanvas(w, h);
}

function draw() {
    const dt = deltaTime / 105000;
    update(dt);


    background(0);
    env.orbs.forEach((orb) => {
        const speed = Math.sqrt(
            orb.velocity_x * orb.velocity_x +
            orb.velocity_y * orb.velocity_y
        );

        const hue = map(speed/50, 0, 1, 200, 2); // blue -> red

        fill(255, hue, hue);
        circle(
            orb.x * env.canvas.w,
            orb.y * env.canvas.h,
            orb.mass * 10
        );
    });

}



function windowResized() {
    resizeCanvasToFit();
}


function init() {
    const orb_count = env.params.repel_orb_count;
    env.orbs = [];

    const radius = 0.3;

    for (let i = 0; i < orb_count; i++) {

        const theta = Math.random() * Math.PI * 2;
        const r = radius * Math.sqrt(Math.random());

        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);

        const dist = Math.sqrt(x*x + y*y);

        // Avoid division by zero near the center
        const tx = dist > 0 ? -y / dist : 0;
        const ty = dist > 0 ?  x / dist : 0;

        const speed = 1.5;

        env.orbs.push({
            x,
            y,
            mass: Math.random() + 1,
            velocity_x: tx * speed,
            velocity_y: ty * speed,
            accelerations_x: 0,
            accelerations_y: 0,
            force_x: 0,
            force_y: 0,
        });
    }
}

function update(dt) {
    compute_force();
    update_orbs(dt);
}

function compute_force() {
    for (const orb of env.orbs) {
        orb.force_x = 0;
        orb.force_y = 0;
    }

    for (let i = 0; i < env.orbs.length; i++) {
        for (let j = i + 1; j < env.orbs.length; j++) {
            const dx = env.orbs[j].x - env.orbs[i].x;
            const dy = env.orbs[j].y - env.orbs[i].y;

            const r2 = dx * dx + dy * dy;
            const r = Math.sqrt(r2);

            const eps = 1;
            const F = env.gravity * env.orbs[i].mass * env.orbs[j].mass / (r2 + eps * eps);

            const Fx = F * dx / r;
            const Fy = F * dy / r;

            env.orbs[i].force_x += Fx;
            env.orbs[i].force_y += Fy;
            env.orbs[j].force_x -= Fx;
            env.orbs[j].force_y -= Fy;
        }
    }
}

function update_orbs(dt) {
    for (const orb of env.orbs) {
        orb.accelerations_x = orb.force_x / orb.mass;
        orb.accelerations_y = orb.force_y / orb.mass;

        orb.velocity_x += orb.accelerations_x * dt;
        orb.velocity_y += orb.accelerations_y * dt;

        orb.x += orb.velocity_x * dt;
        orb.y += orb.velocity_y * dt;
    }
}

