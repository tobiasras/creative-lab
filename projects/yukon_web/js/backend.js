/**
 * In-browser Yukon engine (no WebSocket). Same command/move text protocol as the C server.
 */

const RANKS = "A23456789TJQK";
const SUITS = "SHDC";
const RED_SUITS = new Set(["H", "D"]);
const NUM_COLUMNS = 7;
const NUM_FOUNDATIONS = 4;

// --------------------------------------------------------------------------- card helpers

function rankValue(rank) {
    return RANKS.indexOf(rank) + 1;
}

function isRed(suit) {
    return RED_SUITS.has(suit);
}

function colorsAlternate(a, b) {
    return isRed(a.suit) !== isRed(b.suit);
}

function cardFromString(text, hidden = false) {
    return { rank: text[0], suit: text[1], hidden };
}

function cardId(card) {
    return card.hidden ? "[]" : card.rank + card.suit;
}

function parseCardToken(token) {
    if (token.length !== 2) return null;
    if (!RANKS.includes(token[0]) || !SUITS.includes(token[1])) return null;
    return token;
}

function buildDefaultDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push(rank + suit);
        }
    }
    return deck;
}

function validateDeckStrings(cards) {
    if (cards.length !== 52) return "Deck must have exactly 52 cards";
    const counts = { S: 0, H: 0, D: 0, C: 0 };
    const seen = new Set();
    for (const text of cards) {
        const parsed = parseCardToken(text);
        if (!parsed) return `Invalid card: ${text}`;
        if (seen.has(parsed)) return `Duplicate card: ${parsed}`;
        seen.add(parsed);
        counts[parsed[1]]++;
    }
    for (const suit of SUITS) {
        if (counts[suit] !== 13) return `Need 13 of each suit (got ${counts[suit]} ${suit})`;
    }
    return null;
}

function parseDeckFile(text) {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const err = validateDeckStrings(lines);
    if (err) return { error: err };
    return { cards: lines };
}

// --------------------------------------------------------------------------- deck operations

function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function splitShuffle(deck, cutAt) {
    const n = Number(cutAt);
    if (!Number.isInteger(n) || n < 1 || n > 52) return null;
    const left = deck.slice(0, n);
    const right = deck.slice(n);
    const out = [];
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < left.length) out.push(left[i]);
        if (i < right.length) out.push(right[i]);
    }
    return out;
}

function deckToFileText(deck) {
    return deck.join("\n") + "\n";
}

// --------------------------------------------------------------------------- Yukon deal

function dealYukon(deckStrings) {
    const deck = deckStrings.map((s) => cardFromString(s, false));
    let idx = 0;
    const tableau = Array.from({ length: NUM_COLUMNS }, () => []);

    for (let col = 0; col < NUM_COLUMNS; col++) {
        for (let row = 0; row <= col; row++) {
            const card = { ...deck[idx++], hidden: row < col };
            tableau[col].push(card);
        }
        tableau[col].reverse();
    }

    for (let col = 1; col < NUM_COLUMNS; col++) {
        for (let k = 0; k < 4; k++) {
            const card = { ...deck[idx++], hidden: false };
            tableau[col].unshift(card);
        }
    }

    return {
        mode: "play",
        tableau,
        foundations: Array.from({ length: NUM_FOUNDATIONS }, () => []),
    };
}

// --------------------------------------------------------------------------- move rules

function canPlaceOnFoundation(card, foundation) {
    if (foundation.length === 0) {
        return rankValue(card.rank) === 1;
    }
    const top = foundation[0];
    return card.suit === top.suit && rankValue(card.rank) === rankValue(top.rank) + 1;
}

function canPlaceOnTableau(moving, dest) {
    const bottom = moving[moving.length - 1];
    if (dest.length === 0) {
        return rankValue(bottom.rank) === 13;
    }
    const destTop = dest[0];
    return (
        colorsAlternate(bottom, destTop) &&
        rankValue(bottom.rank) === rankValue(destTop.rank) - 1
    );
}

function flipNewTop(pile) {
    if (pile.length > 0 && pile[0].hidden) {
        pile[0].hidden = false;
    }
}

function isWon(foundations) {
    return foundations.every(
        (pile) => pile.length === 13 && pile[0].rank === "K"
    );
}

// --------------------------------------------------------------------------- state serialization

function serializeStartup(deckStrings, hiddenFlags) {
    const deck = deckStrings.map((text, i) =>
        hiddenFlags[i] ? "[]" : text
    );
    return { mode: "startup", deck };
}

function serializePlay(game) {
    return {
        mode: "play",
        tableau: game.tableau.map((col) => col.map(cardId)),
        foundations: game.foundations.map((pile) => pile.map(cardId)),
    };
}

// --------------------------------------------------------------------------- engine

export function createEngine(callbacks) {
    const { onState, onResponse, onDeckDownload } = callbacks;

    let mode = "startup";
    let deck = [];
    let deckHidden = [];
    let savedDeck = [];
    let game = null;

    function emitState() {
        if (mode === "startup") {
            onState(serializeStartup(deck, deckHidden));
        } else {
            onState(serializePlay(game));
        }
    }

    function reply(message, pushState = false) {
        onResponse(message);
        if (pushState) emitState();
    }

    function setDeck(cards, hidden = false) {
        deck = [...cards];
        deckHidden = deck.map(() => hidden);
        savedDeck = [...deck];
        mode = "startup";
        game = null;
        emitState();
    }

    function parseMove(line) {
        const parts = line.split("->");
        if (parts.length !== 2) return null;

        const srcMatch = parts[0].match(/^(C[1-7]|F[1-4])(?::([A2-9TJQK][SHDC]))?$/);
        const destMatch = parts[1].match(/^(C[1-7]|F[1-4])$/);
        if (!srcMatch || !destMatch) return null;

        return {
            src: srcMatch[1],
            card: srcMatch[2] || null,
            dest: destMatch[1],
        };
    }

    function pileIndex(token) {
        if (token.startsWith("C")) return Number(token.slice(1)) - 1;
        if (token.startsWith("F")) return Number(token.slice(1)) - 1;
        return -1;
    }

    function getPlayPile(token) {
        if (token.startsWith("C")) return game.tableau[pileIndex(token)];
        return game.foundations[pileIndex(token)];
    }

    function tryMove(line) {
        const move = parseMove(line);
        if (!move) {
            reply("Invalid move syntax");
            return;
        }

        const srcPile = getPlayPile(move.src);
        const destPile = getPlayPile(move.dest);
        if (!srcPile || !destPile) {
            reply("Invalid pile");
            return;
        }

        let startIdx = 0;
        if (move.card) {
            startIdx = srcPile.findIndex((c) => cardId(c) === move.card);
            if (startIdx === -1) {
                reply("Card not found");
                return;
            }
        }

        /* Pile index 0 is the top. A move takes the grabbed card and every card above it. */
        const moving = srcPile.slice(0, startIdx + 1);
        if (moving.length === 0) {
            reply("Nothing to move");
            return;
        }
        if (moving.some((c) => c.hidden)) {
            reply("Cannot move hidden cards");
            return;
        }

        const destIsFoundation = move.dest.startsWith("F");
        if (destIsFoundation) {
            if (moving.length !== 1) {
                reply("Only one card to foundation");
                return;
            }
            if (!canPlaceOnFoundation(moving[0], destPile)) {
                reply("Invalid foundation move");
                return;
            }
        } else if (!canPlaceOnTableau(moving, destPile)) {
            reply("Invalid tableau move");
            return;
        }

        srcPile.splice(0, startIdx + 1);
        destPile.unshift(...moving);
        flipNewTop(srcPile);

        if (isWon(game.foundations)) {
            reply("OK — you win!", true);
            return;
        }
        reply("OK", true);
    }

    async function handleCommand(line) {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.includes("->")) {
            if (mode !== "play") {
                reply("No game in progress");
                return;
            }
            tryMove(trimmed);
            return;
        }

        const [cmd, ...args] = trimmed.split(/\s+/);
        const arg = args.join(" ").trim();

        switch (cmd) {
            case "LD": {
                if (arg) {
                    try {
                        const res = await fetch(arg);
                        if (!res.ok) {
                            reply(`Could not load deck: ${arg}`);
                            return;
                        }
                        const parsed = parseDeckFile(await res.text());
                        if (parsed.error) {
                            reply(parsed.error);
                            return;
                        }
                        setDeck(parsed.cards, false);
                        reply("OK");
                    } catch {
                        reply(`Could not load deck: ${arg}`);
                    }
                    return;
                }
                setDeck(buildDefaultDeck(), false);
                reply("OK");
                return;
            }

            case "SW": {
                if (mode !== "startup") {
                    reply("Show only allowed before play");
                    return;
                }
                deckHidden = deckHidden.map(() => false);
                reply("OK", true);
                return;
            }

            case "SR": {
                if (mode !== "startup") {
                    reply("Shuffle only in startup mode");
                    return;
                }
                if (deck.length !== 52) {
                    reply("Load a deck first");
                    return;
                }
                shuffleInPlace(deck);
                savedDeck = [...deck];
                reply("OK", true);
                return;
            }

            case "SI": {
                if (mode !== "startup") {
                    reply("Split shuffle only in startup mode");
                    return;
                }
                if (deck.length !== 52) {
                    reply("Load a deck first");
                    return;
                }
                const shuffled = splitShuffle(deck, arg);
                if (!shuffled) {
                    reply("Split index must be 1..52");
                    return;
                }
                deck = shuffled;
                savedDeck = [...deck];
                reply("OK", true);
                return;
            }

            case "SD": {
                if (deck.length !== 52) {
                    reply("No deck to save");
                    return;
                }
                const path = arg || "cards.txt";
                const text = deckToFileText(deck);
                if (onDeckDownload) {
                    onDeckDownload(path, text);
                }
                reply("OK");
                return;
            }

            case "P": {
                if (deck.length !== 52) {
                    reply("Load a deck first");
                    return;
                }
                savedDeck = [...deck];
                game = dealYukon(deck);
                mode = "play";
                reply("OK", true);
                return;
            }

            case "Q": {
                if (mode !== "play") {
                    reply("No game to end");
                    return;
                }
                deck = [...savedDeck];
                deckHidden = deck.map(() => false);
                mode = "startup";
                game = null;
                reply("OK", true);
                return;
            }

            case "QQ":
                reply("OK");
                return;

            default:
                reply(`Unknown command: ${cmd}`);
        }
    }

    function send(cmd) {
        return handleCommand(cmd);
    }

    return { send };
}
