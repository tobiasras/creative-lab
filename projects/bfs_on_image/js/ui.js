export function initUI(settings, handlers) {
    const startBtnElement = document.getElementById("startBtn")
    const pauseBtnElement = document.getElementById("pauseBtn")
    const reloadBtnElement = document.getElementById("reloadBtn")
    const animationSpeedElement = document.getElementById("animationSpeed")

    const primaryColorElement = document.getElementById("primaryColor")
    const secondaryColorElement = document.getElementById("secondaryColor")
    const crawlerCountElement = document.getElementById("crawlerCount")
    const randomCrawlersElement = document.getElementById("randomCrawlers")


    settings.loadImage = {
        crawlerRandom: false,
    }
    settings.animationSpeed = 1010 - animationSpeedElement.value * 10
    settings.crawlerCount = crawlerCountElement.value

    if (!settings.drawSettings) {
        settings.drawSettings = {}
    }
    settings.drawSettings.primaryColor = primaryColorElement.value
    settings.drawSettings.background = secondaryColorElement.value


    randomCrawlersElement.addEventListener("input", () => {
        randomCrawlerHandler(settings, randomCrawlersElement)
    })

    startBtnElement.addEventListener("click", handlers.start)
    reloadBtnElement.addEventListener("click", handlers.restart)
    pauseBtnElement.addEventListener("click", handlers.pause)


    animationSpeedElement.addEventListener('input', () => {
        animationSpeedHandler(animationSpeedElement, settings)
    })
    crawlerCountElement.addEventListener("input", () => {
        crawlerCountHandler(settings, crawlerCountElement)
    })
    primaryColorElement.addEventListener("input", () => {
        settings.drawSettings.primaryColor = primaryColorElement.value
        handlers.colorPrimary(primaryColorElement.value)
    })
    secondaryColorElement.addEventListener("input", () => {
        settings.drawSettings.background = secondaryColorElement.value
        handlers.colorBackground(secondaryColorElement.value)
    })





}


function animationSpeedHandler(input, settings) {
    settings.animationSpeed = 1010 - input.value * 10;
}

function randomCrawlerHandler(settings, randomCrawlersElement) {
    settings.loadImage.crawlerRandom = randomCrawlersElement.checked
}








function crawlerCountHandler(settings, crawlerCountElement) {
    settings.crawlerCount = crawlerCountElement.value
}















