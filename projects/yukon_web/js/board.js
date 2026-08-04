

const gameboard = document.getElementById("game")
const foundations = document.getElementsByClassName("foundation")
const cols = document.getElementsByClassName('column')

const deckboard = document.getElementById("deck")
const deckboardMenu = document.getElementById("deck-menu")


let isGaming = false;
let sendCmd = () => {};




let currentDrag = null;

export default function initBoard(sendCommand) {
    if (typeof sendCommand === 'function') sendCmd = sendCommand;
    return {
        load: (state) => {
            loadState(state)
        }
    }
}

function loadState(state) {
    if (state.mode === 'startup') {
        gameboard.classList.add("hide")
        deckboardMenu.classList.remove("hide")

        renderDeck(state)

        isGaming = false
    } else {
        gameboard.classList.remove('hide')
        deckboardMenu.classList.add('hide')

        renderGame(state)

        isGaming = true
    }
}


function renderDeck(state) {
    deckboard.replaceChildren();
    state.deck.forEach(card => {

        const cardHtml = cardToCardHtml(card, false, false)
        deckboard.appendChild(cardHtml)

    })
}

function suitToGlyph(suit) {
    switch (suit) {
        case 'S': return '\u2660'; // ♠
        case 'H': return '\u2665'; // ♥
        case 'C': return '\u2663'; // ♣
        case 'D': return '\u2666'; // ♦
        default:  return suit;
    }
}

function cardToCardHtml(cardText, isHalf = false, draggable = false) {
    const element = document.createElement("p")
    element.classList.add("card")


    if (cardText === "--") {
        element.textContent = `
  .--.  
  :  :  
  :  :  
  '--'  
        `
    } else if (cardText === "[]") {

        if (!isHalf) {


            element.textContent = `.------.
| .--. |
| :::: |
| :::: |
| '--' |
.______.`

        } else {
            element.textContent = `.------.
| .--. |
| :::: |`
        }


    } else {
        element.draggable = !!draggable;

        const val = cardText[0]
        const suit = cardText[1]

        /* Engine sends suit as a single ASCII letter (S/H/C/D); render as the
         * familiar pip glyphs instead. We keep cardText/move tokens in the
         * letter form so the wire protocol is unchanged. */
        const suitGlyph = suitToGlyph(suit);

        let className = ""
        if (suit === 'H' || suit === 'D') {
            className = 'red'
        } else {
            className = 'black'
        }
        element.classList.add(className)


        if (!isHalf) {
            element.textContent = element.textContent = `.------.
|${suitGlyph} __ ${val}|
| (\\/) |
| :\\/: |
|${val} -- ${suitGlyph}|
\`------\`
`

        } else {

            element.textContent = element.textContent = `.------.
|${suitGlyph} __ ${val}|
| (\\/) |`

        }


    }


    return element

}


function renderGame(state) {
    Array.from(cols).forEach((colEl, colIdx) => {
        colEl.replaceChildren();
        attachDropHandlers(colEl, `C${colIdx + 1}`);

        const cards = state.tableau[colIdx];
        /* Engine: index 0 = pile top. Render bottom-of-pile first so hidden
         * cards sit at the top of the column and the playable top at the bottom. */
        for (let j = cards.length - 1; j >= 0; j--) {
            const card = cards[j];
            const isTopOfPile = j === 0;
            const faceUp = card !== "[]";
            const cardEl = cardToCardHtml(card, !isTopOfPile, faceUp);
            if (cardEl.draggable) {
                attachCardDragHandlers(cardEl, `C${colIdx + 1}:${card}`);
            }
            colEl.appendChild(cardEl);
        }
    });

    Array.from(foundations).forEach((fEl, fIdx) => {
        fEl.replaceChildren();
        attachDropHandlers(fEl, `F${fIdx + 1}`);

        const cards = state.foundations[fIdx];
        if (cards.length !== 0) {
            /* engine prepends to head, so cards[0] is the highest card on top */
            const top = cards[0];
            const cardEl = cardToCardHtml(top, false, true);
            if (cardEl.draggable) {
                attachCardDragHandlers(cardEl, `F${fIdx + 1}:${top}`);
            }
            fEl.appendChild(cardEl);
        } else {
            fEl.appendChild(cardToCardHtml('--', false, false));
        }
    });
}


/* ------------------------------------------------------------------ drag */

function attachCardDragHandlers(cardEl, sourceToken) {
    cardEl.addEventListener('dragstart', (e) => {
        const stack = [];
        for (let n = cardEl; n != null; n = n.nextElementSibling) {
            stack.push(n);
        }
        const ghost = buildDragGhost(stack);
        document.body.appendChild(ghost);
        try {
            e.dataTransfer.setData('text/plain', sourceToken);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setDragImage(ghost, 20, 10);
        } catch (_) {
        }
        stack.forEach((el) => el.classList.add('dragging'));
        currentDrag = { source: sourceToken, ghost, stack };
    });
    cardEl.addEventListener('dragend', () => {
        cleanupDrag();
    });
}

function buildDragGhost(stack) {
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    stack.forEach((el) => {
        const clone = el.cloneNode(true);
        clone.classList.remove('dragging');
        ghost.appendChild(clone);
    });
    return ghost;
}

function cleanupDrag() {
    if (currentDrag) {
        currentDrag.stack.forEach((el) => el.classList.remove('dragging'));
        if (currentDrag.ghost && currentDrag.ghost.parentNode) {
            currentDrag.ghost.parentNode.removeChild(currentDrag.ghost);
        }
    }
    document.querySelectorAll('.drop-active').forEach((el) =>
        el.classList.remove('drop-active'));
    currentDrag = null;
}

function attachDropHandlers(targetEl, destToken) {
    targetEl.addEventListener('dragover', (e) => {
        if (!currentDrag) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        targetEl.classList.add('drop-active');
    });

    targetEl.addEventListener('dragenter', (e) => {
        if (!currentDrag) return;
        e.preventDefault();
        targetEl.classList.add('drop-active');
    });

    targetEl.addEventListener('dragleave', (e) => {
        if (!e.relatedTarget || !targetEl.contains(e.relatedTarget)) {
            targetEl.classList.remove('drop-active');
        }
    });

    targetEl.addEventListener('drop', (e) => {
        e.preventDefault();
        targetEl.classList.remove('drop-active');
        if (!currentDrag) return;

        const src = currentDrag.source;
        /* Don't bother the engine with no-op moves like C7:AS->C7. */
        if (src.startsWith(destToken + ':') || src === destToken) {
            cleanupDrag();
            return;
        }

        sendCmd(`${src}->${destToken}`);

        cleanupDrag();
    });
}
