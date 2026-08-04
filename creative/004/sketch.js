let shaderProgram;
let frameCounter = 0;
const FRAGMENT_COUNT = 8;

let pause = false;


document.addEventListener('keydown', function(e){  
    if (e.keyCode === 32) {
        console.log("pausing");
        pause = !pause
    }
});

document.addEventListener('click', () => {
    const mx = (mouseX - env.canvas.w / 2) / env.canvas.scale;
    const my = (mouseY - env.canvas.h / 2) / env.canvas.scale;

    const impact = 5;

    env.orbs.forEach(orb => {
        const dx = orb.x - mx;
        const dy = orb.y - my;

        const r = Math.hypot(dx, dy);
        if (r < 1e-6) return;

        const strength = impact / (r + 0.05); // stronger when closer

        orb.velocity_x += dx / r * strength;
        orb.velocity_y += dy / r * strength;
    });
});
 


let font;

const env = {
    params: {
        repel_orb_count:500,
    },
    orbs: [],
    gravity: 1,
    center_strenth: 0.5,
    canvas: {
        w: 0,
        h: 0,
        scale: 0
    }
};


function preload() {
    font = loadFont('../assets/fonts/Consolas-Regular.ttf');
}

function canvasSize() {
    return [windowWidth, windowHeight];
}

function setup() {
    pixelDensity(1);
    
    const [w, h] = canvasSize();
    env.canvas.h = h
    env.canvas.w = w
    env.canvas.scale = Math.min(env.canvas.w, env.canvas.h);

    const canvas = createCanvas(w, h, WEBGL);
    canvas.parent('sketch-container');
    noStroke();


    textFont(font);      
    textSize(32);


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
    env.canvas.scale = Math.min(env.canvas.w, env.canvas.h);
    resizeCanvas(w, h);
}






function draw() {
    const dt = deltaTime / 100000;
    
    const p_x = mouseX - (env.canvas.w / 2) 
    const p_y = mouseY - (env.canvas.h / 2) 
     
    background(0, 0, 0);

    if (!pause) {
        update(dt);
    } 
    


    // debug
    const mouse_orb = {
        x: (mouseX - (env.canvas.w / 2)) / env.canvas.scale,
        y: (mouseY - (env.canvas.h / 2)) / env.canvas.scale,
        mass: env.orbs[2].mass
    } 


    let x = 0
    let y = 0
    env.orbs.forEach(orb => {
        x += orb.x
        y += orb.y
    }) 

    let total = env.orbs.length
    x /= total
    y /= total

    

    stroke('white');
    line(x*env.canvas.scale, y*env.canvas.scale, mouse_orb.x*env.canvas.scale, mouse_orb.y*env.canvas.scale)
    
    fill(255, 0, 0)
    circle(x*env.canvas.scale, y*env.canvas.scale, 10)


    // debug end 





    // draw pointer
        
    noStroke()
    // draw each orb
    env.orbs.forEach((orb) => {
        fill(68, 177, 85);
        circle(
            orb.x * env.canvas.scale,
            orb.y * env.canvas.scale,
            orb.radius
        );
    });
    noStroke()
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
        const speed = 5;
        const mass = Math.random() * 2+2
        env.orbs.push({
            id: i,
            x,
            y,
            mass: mass,
            radius: mass*2,
            velocity_x: tx * speed,
            velocity_y: ty * speed,
            accelerations_x: 0,
            accelerations_y: 0,
            force_x: 0,
            force_y: 0
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
            let orb_i = env.orbs[i]
            let orb_j = env.orbs[j]

            const { Fx, Fy } = calc_force(orb_i, orb_j)
        
            env.orbs[i].force_x += Fx;
            env.orbs[i].force_y += Fy;
            
            env.orbs[j].force_x -= Fx;
            env.orbs[j].force_y -= Fy;

            
            const mouse_orb = {
                x: (mouseX - (env.canvas.w / 2)) / env.canvas.scale,
                y: (mouseY - (env.canvas.h / 2)) / env.canvas.scale,
                mass: 10
            } 

            let {Fx: a1, Fy: b1} = calc_force(mouse_orb, env.orbs[i])
            env.orbs[i].force_x += a1*-1;
            env.orbs[i].force_y += b1*-1;
            
            let {Fx: a2, Fy: b2} = calc_force(mouse_orb, env.orbs[j])
            env.orbs[j].force_x += a2*-1;
            env.orbs[j].force_y += b2*-1;
        }
    }
}


function calc_force(orb_1, orb_2) {
    const dx = orb_2.x - orb_1.x;
    const dy = orb_2.y - orb_1.y;

    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);

    if (r < 1e-6) {
        return { Fx: 0, Fy: 0 };
    }

    const eps = 1;
    const F = env.gravity * orb_2.mass * orb_1.mass / (r2 + eps * eps);

    return {
        Fx: F * dx / r,
        Fy: F * dy / r
    };
}




function update_orbs(dt) {
    // Update motion
    for (const orb of env.orbs) {
        orb.accelerations_x = orb.force_x / orb.mass;
        orb.accelerations_y = orb.force_y / orb.mass;

        orb.velocity_x += orb.accelerations_x * dt;
        orb.velocity_y += orb.accelerations_y * dt;

        const damping = 0.99; // adjust as needed
        orb.velocity_x *= damping;
        orb.velocity_y *= damping;


        orb.x += orb.velocity_x * dt;
        orb.y += orb.velocity_y * dt;
    }

}

function distance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
    
