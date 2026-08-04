let saveMode = false

let shaderProgram;
let totalFrames = 90*60
var fps = 60;
let frameCounter = 0

function preload() {
    // Load shaders
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
    noStroke();

    if (saveMode) {
        noLoop();
    }

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onViewportChange);
    }

    // Start the frame export process
    redraw();
}

function onViewportChange() {
    const [w, h] = canvasSize();
    resizeCanvas(w, h);
}

let r = 0.5

function draw() {

    // Use the shader
    shader(shaderProgram);

    // Calculate time based on frame counter for consistency
    let time_val = frameCounter / fps;


    speed = 8

    let x = r * cos(frameCount / speed)
    let y = r * sin(frameCount / speed)

    let dr = noise(x * 0.3, y * 0.15, frameCount * 0.05) * 1 - 10; // small offset ±10
    vmag = (r * 2) * 6

    let center_x1 = x + cos(vmag) * dr
    let center_y1 = y + sin(vmag) * dr


    const wideLayout = width > 1200 && width > height * 1.2;
    const anchorX1 = wideLayout ? 2 : 0.5;
    const anchorY1 = wideLayout ? 0.6 : 0.5;

    center_x1 = width * anchorX1 + center_x1 * 8
    center_y1 = height * anchorY1 + center_y1 * 2

    let x1 = r * cos(frameCount / speed) * -1
    let y2 = r * sin(frameCount / speed) * -1
    let center_x2 = x1 - cos(vmag) * dr // maybe plus here
    let center_y2 = y2 - sin(vmag) * dr


    center_x2 = width * 0.5 + center_x2 * 8
    center_y2 = height * 0.5 + center_y2 * 8


    // Set shader uniforms (variables you can pass to the shader)
    shaderProgram.setUniform('u_time', time_val);
    shaderProgram.setUniform('u_resolution', [width, height]);
    shaderProgram.setUniform('u_mouse1', [center_x1,  height - center_y1]);
    shaderProgram.setUniform('u_mouse2', [center_x2,  height - center_y2]);

    rect(0, 0, width, height);

    frameCounter++;



}

function windowResized() {
    const [w, h] = canvasSize();
    resizeCanvas(w, h);
}

