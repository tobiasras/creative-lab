import initConsole from "./console.js";
import initBoard from "./board.js";
import { createEngine } from "./backend.js";

let logger;
let board;
let engine;

function downloadDeck(filename, text) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function sendCommand(cmd) {
    logger.log("[client]: " + cmd);
    engine.send(cmd);
}

function main() {
    const consoleEl = document.getElementById("console");
    logger = initConsole(consoleEl);

    engine = createEngine({
        onState(state) {
            logger.log("[Engine]: Update board");
            board.load(state);
        },
        onResponse(body) {
            const trimmed =
                body.length > 200 ? body.slice(0, 200) + "..." : body;
            logger.log(`[Engine]: ${trimmed}`);
        },
        onDeckDownload: downloadDeck,
    });

    setupButtonListeners();
    board = initBoard(sendCommand);

    engine.send("LD");
}

function setupButtonListeners() {
    document.querySelectorAll(".cmd-btn").forEach((btn) => {
        const cmd = btn.dataset.cmd;
        if (!cmd) return;

        btn.addEventListener("click", () => {
            const input = document.querySelector(
                `input.cmd-input[data-cmd="${cmd}"]`
            );
            const arg = input ? input.value.trim() : "";
            sendCommand(arg ? `${cmd} ${arg}` : cmd);
        });
    });
}

main();
