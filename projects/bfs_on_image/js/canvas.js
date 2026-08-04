export function loadCanvas() {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d")

    const settings = {
        "gridSize": 0,
        "animationSpeed": 0,
        "autoScale": true,
        "width": window.innerWidth,
        "height": window.innerHeight,
        "ctx": ctx
    }

    canvas.width = settings.width
    canvas.height = settings.height

    return settings
}





export function clearCanvas(settings) {
    settings.ctx.fillStyle = settings.drawSettings.background
    settings.ctx.fillRect(0, 0, settings.width, settings.height)
}


export function draw(settings, index) {
    let encoding = settings.image.encoding
    encoding.forEach(blob => {
        if (blob[index]) {
            draw_cell(settings, blob[index])
        }
    })
}

function draw_cell(settings, {x, y}) {
    const ctx = settings.ctx;
    const {size, translateX, translateY } = settings.drawSettings

    const drawX = Math.floor((x * size) + translateX  ) ;
    const drawY = Math.floor((y * size  + translateY));

    ctx.fillStyle = settings.drawSettings.primaryColor;

    ctx.fillRect(drawX, drawY, size, size);  // Use fillRect directly
}