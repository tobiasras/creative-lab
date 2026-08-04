



function shuffleArray(array) {
    for (let i = array.length- 1; i > 0 ; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i];
        array[i] = array[j]
        array[j] = temp
    }
}
/*
*/


function crawl(component, image, visited, startPos, settings) {
    const directions = [
        [1, 0], [1, -1], [0, -1], [-1, -1],
        [-1, 0], [-1, 1], [0, 1], [1, 1]
    ];

    const stack = [startPos];

    while (stack.length > 0) {

        if (settings.loadImage.crawlerRandom) {
            shuffleArray(directions)
        }

        const pos = stack.pop();
        const key = `${pos.x},${pos.y}`;

        if (visited.has(key)) continue;
        visited.add(key);
        component.push(pos);

        for (const [dx, dy] of directions) {
            const x = pos.x + dx;
            const y = pos.y + dy;

            if (x < 0 || x >= image[0].length || y < 0 || y >= image.length) continue;

            const neighborKey = `${x},${y}`;
            if (visited.has(neighborKey)) continue;

            if (image[y][x] > 127) {
                stack.push({ x, y });
            }
        }
    }
}


function createEncoding(image, settings) {

    const result = [];
    const visited = new Set();

    for (let y = 0; y < image.length; y++) {
        for (let x = 0; x < image[0].length; x++) {
            const key = `${x},${y}`;
            if (image[y][x] > 127 && !visited.has(key)) {
                const component = [];
                crawl(component, image, visited, { x, y }, settings);
                result.push(component);
            }
        }
    }
    return result;
}

export async function processImage(url, settings) {

    const imageBitMap = await loadImage(url)

    if (imageBitMap === undefined) return

    let width = imageBitMap.width
    let height = imageBitMap.height

    const offscreen = new OffscreenCanvas(imageBitMap.width, imageBitMap.height)
    const ctx = offscreen.getContext("2d")

    ctx.drawImage(imageBitMap, 0, 0)

    const imageData = ctx.getImageData(0, 0, width, height);
    let grayScale = toGrayScale(imageData, width, height) // width and height is the images pixel height and width!!

    const image = convertArrayTo2d(grayScale, width)

    let encoding = createEncoding(image, settings)

    encoding = transformEncoding(encoding, settings.crawlerCount)


    return {
        "encoding": encoding,
        "data": image,
        "width": width,
        "height": height
    }

}

function transformEncoding(encoding, chunks){
    encoding = rebalance(encoding, chunks)
    return encoding

}


function rebalance(listOfLists,  nChunks) {
    const allItems = listOfLists.flat();
    const avgChunkSize = Math.ceil(allItems.length / nChunks);
    const balanced = [];

    for (let i = 0; i < nChunks; i++) {
        const chunk = allItems.slice(i * avgChunkSize, (i + 1) * avgChunkSize);
        if (chunk.length)
            balanced.push(chunk);
    }

    return balanced;
}




function convertArrayTo2d(array, width) {
    const list = [[]]

    let y = 0
    let count = 0
    let x = 0

    while (count !== array.length) {
        if (x === width) {
            x = 0
            y += 1
            list.push([])
        }
        list[y].push(array[count])

        x += 1
        count += 1
    }

    return list

}

function toGrayScale(imageData) {
    const gray = new Uint8ClampedArray(imageData.width * imageData.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i++) {
        const r = data[i * 4]
        const g = data[i * 4 + 1]
        const b = data[i * 4 + 2]

        gray[i] = Math.round((r + g + b) / 3)
    }
    return gray
}


async function loadImage(url) {
    const res = await fetch(url)

    if (!res.ok) {
        console.log("failed to load image")
        return
    }

    let blob = await res.blob()

    try {
        return await createImageBitmap(blob)
    } catch (e) {
        console.log("failed to convert image", e)

    }
}

