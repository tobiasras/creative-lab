import {loadCanvas, clearCanvas, draw} from "./canvas.js";
import {initUI} from "./ui.js"
import {processImage} from "./imageProcessing.js";


let settings = loadCanvas()

const handlers = {
    start: () => startAnimation(),
    play: () => startAnimation(), // Same as start
    pause: () => pauseAnimation(),
    restart: () => restart(settings),
    clear: () => clearAnimation(),
    colorBackground: (background) => setBackground(background),
    colorPrimary: (primary) => setPrimary(primary)

};

initUI(settings, handlers)

async function loadImage() {
    settings.image = await processImage("./assets/building.png", settings)

    const size = 1

    if (!settings.drawSettings) {
        settings.drawSettings = {}
    }

    settings.drawSettings.size = size
    settings.drawSettings.translateX = (settings.width - (settings.image.width * size)) / 2
    settings.drawSettings.translateY = (settings.height - (settings.image.height * size)) / 2
}

await loadImage();


clearCanvas(settings)


let index = 0;
let clearGameLoop = false;
let isAnimating = false;
let timeoutId = null;


function gameLoop() {
    if (!isAnimating) return;

    let delay = settings.animationSpeed || 100;

    draw(settings, index);
    index++;

    const encodingLength = settings.image.encoding[0]?.length || 0;
    if (index >= encodingLength) {
        isAnimating = false;
        return;
    }

    timeoutId = setTimeout(gameLoop, delay);
}


function startAnimation() {
    if (!isAnimating) {
        isAnimating = true;
        clearGameLoop = false;
        gameLoop();
    }
}

function pauseAnimation() {
    isAnimating = false;
}

async function restart(settings) {
    await loadImage()
    if (timeoutId) clearTimeout(timeoutId);
    index = 0;
    clearCanvas(settings);
    isAnimating = true;
    gameLoop();
}

function clearAnimation() {
    index = 0;
    clearGameLoop = true;
    isAnimating = false;
    clearCanvas(settings);
}


function setPrimary(primary) {
    settings.drawSettings.primaryColor = primary
}
function setBackground(background) {
    settings.drawSettings.background = background
    clearCanvas(settings);
}


startAnimation()



















