


export default function initConsole(element) {
    return {
        log: (msg) => logToConsole(msg, element)
    }
}


const logToConsole = (msg, element) => {
    if (!element) return
    const p = document.createElement("p")
    msg = safeText(msg)
    p.textContent = msg
    element.prepend(p)


};

function safeText(text) {
    const max_char = 43
    if (text.length > max_char) {
        text = text.slice(0, max_char) + "..."
    }
    return text
}
