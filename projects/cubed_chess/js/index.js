import {createBoard} from "./chessboard.js";
import {animateLoop, scene, retrieveTileOnClick} from "./threeSettings.js";
import {UIController} from "./ui.js";
import {
    checkCheckmate,
    getGameBoardTileFromTile,
    movePiece,
    normalizeTileName,
    removeAllHighlights,
    setupPieces,
    showPossibleMoves,
    whenTexturesReady,
} from "./gamecontroller.js";

const ui = new UIController()


export let gameBoard = {}

let whiteKing
let blackKing


let freePlayMode = true;

async function startGame({freePlay = false} = {}) {
    await whenTexturesReady();

    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    gameBoard = createBoard(scene);
    const kings = setupPieces();
    freePlayMode = freePlay;
    currentPlayerTurn = 'w';
    gameHasStarted = true;

    whiteKing = kings.whiteKing;
    blackKing = kings.blackKing;

    hasHighlighted = false;
    selectedPiece = undefined;
    possibleMoves = new Set();

    ui.refreshSideNav(gameBoard);
}

whenTexturesReady().then(() => {
    ui.prepareTurnUI(false);
    startGame({freePlay: true});
});


let currentPlayerTurn = 'w';
let selectedPiece
let hasHighlighted = false
let possibleMoves = new Set();
let gameHasStarted = false



document.onmousedown = (event) => {
    if (event.button !== 0)
        return

    if (event.target.closest('.nav, .menu, .slide-menu')) {
        return
    }
    const tileModel = retrieveTileOnClick(event)
    if (!tileModel)
        return;

    const tileName = normalizeTileName(tileModel.object.name)
    if (!tileName) {
        return
    }

    if (!hasHighlighted) {
        const tileGameObject = getGameBoardTileFromTile(tileName)
        if (!tileGameObject?.hasPiece) {
            return
        }

        if (gameHasStarted && !freePlayMode && tileGameObject.piece.type[0] !== currentPlayerTurn) {
            return
        }

        possibleMoves = showPossibleMoves(tileGameObject.tile)

        if (!possibleMoves || possibleMoves.size === 0) {
            return
        }
        selectedPiece = tileGameObject
        hasHighlighted = true

        return
    }


    let pieceToMove = false
    let destination

    possibleMoves.forEach((highlightedTiles) => {
        if (highlightedTiles.tile === tileName) {
            destination = highlightedTiles.tile
            pieceToMove = true;
        }
    })

    // player pressed outside of possible moves, we there remove all highlighedted moves
    if (!pieceToMove) {
        removeAllHighlights([...possibleMoves])
        selectedPiece = {}
        hasHighlighted = false
        possibleMoves = new Set();
        return;
    }


    if (gameHasStarted && !freePlayMode && selectedPiece.piece.type[0] !== currentPlayerTurn) {
        return;
    }

    movePiece(selectedPiece.tile, destination)
    removeAllHighlights([...possibleMoves])

    if (!freePlayMode) {
        ui.switchPlayerTurn()

        const kingTile = currentPlayerTurn === 'w' ? whiteKing : blackKing
        const kingPieceType = currentPlayerTurn === 'w' ? 'wK' : 'bK'

        checkCheckmate(currentPlayerTurn === 'w' ? 'b' : 'w', {
            tile: kingTile,
            piece: {
                type: kingPieceType
            }
        })

        if (currentPlayerTurn === 'w') {
            currentPlayerTurn = 'b';
        } else {
            currentPlayerTurn = 'w';
        }
    }

    selectedPiece = {}
    hasHighlighted = false
    possibleMoves = new Set();

    ui.refreshSideNav(gameBoard);
}




ui.setNormalStartFunc(() => startGame({freePlay: false}))
ui.setFreePlayStartFunc(() => startGame({freePlay: true}))


//removeAllHighlights([...possibleMoves])


animateLoop()






