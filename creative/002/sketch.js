

let shaderProgram;
let frameCounter = 0;

let size = 0.09;
size_increment = 0.01;
max_size = 1
min_size = 0



const env = {
  params: {
    repel_orb_count: 20
  },
  orbs: [],
  gravity: 10,
  center_strenth: 0.2

}



function preload() {
  shaderProgram = loadShader('shader.vert', 'shader.frag');
}

function canvasSize() {
  return [windowWidth, windowHeight];
}

function setup() {
  pixelDensity(1);
  const [w, h] = canvasSize();
  const canvas = createCanvas(w, h, WEBGL);
  canvas.parent('sketch-container');
  noStroke()
  // setup listerners
  addEventListener("wheel", onMouseWheelScroll)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onViewportChange);
  }

  // Sets env and all data needed for sketch
  init()
}

function onViewportChange() {
  const [w, h] = canvasSize();
  resizeCanvas(w, h);
}

// runs all the time
function draw() {
  let dt = deltaTime / 100000;
  update(dt)

  
  shader(shaderProgram);

  let time_val = millis() * 0.001;
  
  shaderProgram.setUniform('u_time', time_val);
  shaderProgram.setUniform('u_scroll', size);
  shaderProgram.setUniform('u_resolution', [width, height]);
  shaderProgram.setUniform('u_mouse', [mouseX, height - mouseY]);


  const objectData = [];
  for (const obj of env.orbs) {
    objectData.push(obj.x);
    objectData.push(obj.y);
    objectData.push(obj.mass);
  }
  shaderProgram.setUniform('u_repel_orbs', objectData);


  
  rect(-width / 2, -height / 2, width, height);
  frameCounter++;
}

function windowResized() {
  const [w, h] = canvasSize();
  resizeCanvas(w, h);
}


function onMouseWheelScroll(event) {
  const movement = event.deltaY
  let dir = 0;
  if (movement < 0) {
    dir = 1
  } else {
    dir = -1
  }
  const force = size_increment * dir
  const result = force + size
  if (result < min_size || result > max_size ){
    return
  }
  size += force
}


function init() {
  const orb_count = env.params.repel_orb_count;
  const padding = 0.2;




  for (let i = 0; i < orb_count; i++) {
    const orb = { 
      x: Math.random() * (2 - 2 * padding) - (1 - padding),
      y: Math.random() * (2 - 2 * padding) - (1 - padding),
      mass: 0.005, 
      accelerations_x: 0,
      accelerations_y: 0,
      velocity_x : 0,
      velocity_y : 0,
      force_x: 0,
      force_y: 0
    }; 
      env.orbs.push(orb) 
    }

    console.log(env)
}


function update(dt) {

  compute_force()
  update_orbs(dt)
}

function compute_force() {
  for (const orb of env.orbs) {
    orb.force_x = 0;
    orb.force_y = 0;
  }

for (let i = 0; i < env.orbs.length; i++) {
  for (let j = i + 1; j < env.orbs.length; j++) {



      const dx = env.orbs[j].x - env.orbs[i].x
      const dy = env.orbs[j].y - env.orbs[i].y

      const r2 =  dx * dx + dy * dy
      const r = Math.sqrt(r2)

      let F = env.gravity * env.orbs[i].mass * env.orbs[j].mass /r2;

      const Fx = F * dx / r;
      const Fy = F * dy / r;

      env.orbs[i].force_x += Fx;
      env.orbs[i].force_y += Fy;
      env.orbs[j].force_x -= Fx;
      env.orbs[j].force_y -= Fy;
      

      env.orbs[i].force_x  += -env.center_strenth * env.orbs[i].x;
      env.orbs[i].force_y += -env.center_strenth * env.orbs[i].y;
      env.orbs[j].force_x  += -env.center_strenth * env.orbs[j].x;
      env.orbs[j].force_y += -env.center_strenth * env.orbs[j].y;




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



