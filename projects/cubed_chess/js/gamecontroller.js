import * as THREE from 'three';
import {gameBoard} from "./index.js";
import {scene} from "./threeSettings.js";

const SVG_TEXTURE_SIZE = 128;

const TEXTURE_PATHS = {
    bB: './assets/chess_pieces/tatiana/bB.svg',
    bK: './assets/chess_pieces/tatiana/bK.svg',
    bN: './assets/chess_pieces/tatiana/bN.svg',
    bP: './assets/chess_pieces/tatiana/bP.svg',
    bQ: './assets/chess_pieces/tatiana/bQ.svg',
    bR: './assets/chess_pieces/tatiana/bR.svg',
    wB: './assets/chess_pieces/tatiana/wB.svg',
    wK: './assets/chess_pieces/tatiana/wK.svg',
    wN: './assets/chess_pieces/tatiana/wN.svg',
    wP: './assets/chess_pieces/tatiana/wP.svg',
    wQ: './assets/chess_pieces/tatiana/wQ.svg',
    wR: './assets/chess_pieces/tatiana/wR.svg',
    highlight_1: './assets/highlights/highlight_1.svg',
};

const textures = {};
let texturesReadyPromise = null;

function configureSourceTexture(texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
}

function loadSvgTexture(url) {
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}`);
            }
            return response.text();
        })
        .then((svgText) => new Promise((resolve, reject) => {
            const blob = new Blob([svgText], {type: 'image/svg+xml'});
            const objectUrl = URL.createObjectURL(blob);
            const image = new Image();

            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = SVG_TEXTURE_SIZE;
                canvas.height = SVG_TEXTURE_SIZE;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, SVG_TEXTURE_SIZE, SVG_TEXTURE_SIZE);
                URL.revokeObjectURL(objectUrl);

                const texture = new THREE.CanvasTexture(canvas);
                configureSourceTexture(texture);
                resolve(texture);
            };

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error(`Failed to decode ${url}`));
            };

            image.src = objectUrl;
        }));
}

function loadTexture(key, url) {
    return loadSvgTexture(url).then((texture) => {
        textures[key] = texture;
        return texture;
    });
}

export function whenTexturesReady() {
    if (!texturesReadyPromise) {
        texturesReadyPromise = Promise.all(
            Object.entries(TEXTURE_PATHS).map(([key, url]) => loadTexture(key, url)),
        );
    }
    return texturesReadyPromise;
}

function disposeMaterialMap(material) {
    if (material.map) {
        material.map.dispose();
        material.map = null;
    }
}

const HIGHLIGHT_CAPTURE_COLOR = 0x39ff14;
const CAPTURE_OVERLAY_NAME = 'capture-highlight';

function assignTextureToMaterial(material, sourceTexture, {flipY = true, tint = 0xffffff} = {}) {
    if (!sourceTexture?.image) {
        return false;
    }

    disposeMaterialMap(material);

    const map = sourceTexture.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    map.generateMipmaps = false;
    map.minFilter = THREE.LinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.flipY = flipY;
    map.needsUpdate = true;

    material.map = map;
    material.transparent = true;
    material.depthWrite = false;
    material.color.set(tint);
    material.needsUpdate = true;
    return true;
}

function hideCaptureOverlay(pieceMesh) {
    const overlay = pieceMesh.getObjectByName(CAPTURE_OVERLAY_NAME);
    if (overlay) {
        overlay.visible = false;
    }
}

function showCaptureOverlay(pieceMesh) {
    let overlay = pieceMesh.getObjectByName(CAPTURE_OVERLAY_NAME);
    if (!overlay) {
        const material = new THREE.MeshBasicMaterial({
            color: HIGHLIGHT_CAPTURE_COLOR,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        overlay = new THREE.Mesh(pieceMesh.geometry, material);
        overlay.name = CAPTURE_OVERLAY_NAME;
        overlay.renderOrder = 1;
        pieceMesh.add(overlay);
    }

    overlay.visible = true;
}

export function displayPiece(tile, type) {
    const model = scene.getObjectByName(`$:${tile}`);
    const source = textures[type];
    if (!model || !source) {
        return;
    }

    hideCaptureOverlay(model);
    assignTextureToMaterial(model.material, source);
}

export function clearTile(tileName) {
    const tile = scene.getObjectByName(`$:${tileName}`);
    if (!tile) {
        return;
    }

    disposeMaterialMap(tile.material);
    tile.material.transparent = false;
    resetPieceMaterial(tile.material);
    hideCaptureOverlay(tile);
}

export function createPiece(tile, type) {
    let gameBoardTile = getGameBoardTileFromTile(tile);

    gameBoardTile.hasPiece = true
    gameBoardTile.piece = {
        type: type,
        moves: 0
    }
    displayPiece(tile, type);
}

export function movePiece(fromTile, toTile) {
    const from = getGameBoardTileFromTile(fromTile)
    const to = getGameBoardTileFromTile(toTile)

    to.piece = from.piece
    to.hasPiece = true
    to.piece.moves += 1

    from.piece = {}
    from.hasPiece = false

    displayPiece(toTile, to.piece.type);
    clearTile(fromTile)
}

export function setupPieces() {
    createPiece('1_3_5', "wP")
    createPiece('1_3_7', "wP")
    createPiece('1_3_4', "wP")
    createPiece('1_3_2', "wP")
    createPiece('1_3_1', "wP")
    createPiece('1_3_8', "wP")
    createPiece('1_3_3', "wP")
    createPiece('1_3_6', "wP")

    createPiece('1_4_5', "wK")
    createPiece('1_4_7', "wN")
    createPiece('1_4_2', "wN")
    createPiece('1_4_1', "wR")
    createPiece('1_4_8', "wR")
    createPiece('1_4_3', "wB")
    createPiece('1_4_6', "wB")

    createPiece('1_5_7', "wN")
    createPiece('1_5_4', "wQ")
    createPiece('1_5_2', "wN")
    createPiece('1_5_1', "wR")
    createPiece('1_5_8', "wR")
    createPiece('1_5_3', "wB")
    createPiece('1_5_6', "wB")

    createPiece('1_6_5', "wP")
    createPiece('1_6_7', "wP")
    createPiece('1_6_4', "wP")
    createPiece('1_6_2', "wP")
    createPiece('1_6_1', "wP")
    createPiece('1_6_8', "wP")
    createPiece('1_6_3', "wP")
    createPiece('1_6_6', "wP")

    createPiece('3_3_8', "wP")
    createPiece('3_4_8', "wP")
    createPiece('3_5_8', "wP")
    createPiece('3_6_8', "wP")

    createPiece('4_3_8', "wP")
    createPiece('4_4_8', "wP")
    createPiece('4_5_8', "wP")
    createPiece('4_6_8', "wP")

    createPiece('3_3_1', "bP")
    createPiece('3_4_1', "bP")
    createPiece('3_5_1', "bP")
    createPiece('3_6_1', "bP")

    createPiece('4_3_1', "bP")
    createPiece('4_4_1', "bP")
    createPiece('4_5_1', "bP")
    createPiece('4_6_1', "bP")

    createPiece('6_6_5', "bP")
    createPiece('6_6_7', "bP")
    createPiece('6_6_4', "bP")
    createPiece('6_6_2', "bP")
    createPiece('6_6_1', "bP")
    createPiece('6_6_8', "bP")
    createPiece('6_6_3', "bP")
    createPiece('6_6_6', "bP")


    createPiece('6_4_5', "bK")
    createPiece('6_4_7', "bN")
    createPiece('6_4_2', "bN")
    createPiece('6_4_1', "bR")
    createPiece('6_4_8', "bR")
    createPiece('6_4_3', "bB")
    createPiece('6_4_6', "bB")

    createPiece('6_5_7', "bN")
    createPiece('6_5_4', "bQ")
    createPiece('6_5_2', "bN")
    createPiece('6_5_1', "bR")
    createPiece('6_5_8', "bR")
    createPiece('6_5_3', "bB")
    createPiece('6_5_6', "bB")

    createPiece('6_3_5', "bP")
    createPiece('6_3_7', "bP")
    createPiece('6_3_4', "bP")
    createPiece('6_3_2', "bP")
    createPiece('6_3_1', "bP")
    createPiece('6_3_8', "bP")
    createPiece('6_3_3', "bP")
    createPiece('6_3_6', "bP")

    return {
        blackKing: '6_4_5',
        whiteKing: '1_4_5'
    }
}

export function normalizeTileName(objectName) {
    if (!objectName) {
        return null
    }
    return objectName.startsWith('$:') ? objectName.slice(2) : objectName
}

export function getGameBoardTileFromTile(tile) {
    const tileName = normalizeTileName(tile)
    if (!tileName) {
        return null
    }

    const pos = tileName.split("_").map((val) => +val)
    return gameBoard[pos[0] - 1]?.[pos[1]]?.[pos[2]] ?? null
}

function resolveBoardTile(tileRef) {
    if (!tileRef || tileRef === 0) {
        return null
    }

    if (tileRef.isBoardTile) {
        return tileRef
    }

    return getGameBoardTileFromTile(tileRef.tile)
}

function transformDirectionDiagonal(pos, nextPos, direction) {
    if (pos[0] === 1) {
        if (nextPos[0] === 2) {
            if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }
        if (nextPos[0] === 3) {
            if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = -1
            } else if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = -1
            }
        }
        if (nextPos[0] === 4) {
            if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }
        if (nextPos[0] === 5) {
            if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }
    } else if (pos[0] === 2) {
        if (nextPos[0] === 1) {
            if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = -1
            }
        }

        if (nextPos[0] === 3) {
            if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = 1
            } else if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }

        if (nextPos[0] === 4) {
            if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }

        if (nextPos[0] === 6) {
            if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }


    } else if (pos[0] === 3) {
        if (nextPos[0] === 1) {
            if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = -1
            } else if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = -1
            }
        }

        if (nextPos[0] === 2) {
            if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = 1
            } else if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }

        if (nextPos[0] === 5) {
            if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }

        if (nextPos[0] === 5) {
            if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = -1
            }
        }
    } else if (pos[0] === 4) {
        if (nextPos[0] === 1) {
            if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = -1
                direction[1] = 1
            }
        }

        if (nextPos[0] === 2) {
            if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            } else if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = -1
            }
        }

        if (nextPos[0] === 5) {
            if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            }
        }

        if (nextPos[0] === 6) {
            if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = 1
            }
        }
    } else if (pos[0] === 5) {
        if (nextPos[0] === 1) {
            if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            }
        }

        if (nextPos[0] === 3) {
            if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            }
        }

        if (nextPos[0] === 4) {
            if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            }
        }

        if (nextPos[0] === 6) {
            if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = -1
            } else if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = 1
            }
        }
    } else if (pos[0] === 6) {
        if (nextPos[0] === 2) {
            if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            } else if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = 1
            }
        }

        if (nextPos[0] === 3) {
            if (direction[0] === 1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = 1
            }
        }

        if (nextPos[0] === 4) {
            if (direction[0] === 1 && direction[1] === -1) {
                direction[0] = 1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = 1
            }
        }
        if (nextPos[0] === 5) {
            if (direction[0] === -1 && direction[1] === 1) {
                direction[0] = 1
                direction[1] = 1
            } else if (direction[0] === -1 && direction[1] === -1) {
                direction[0] = -1
                direction[1] = 1
            }
        }
    }


}

function transformDirectionStraight(direction, pos, nextPos) {
    if (direction[0] === 0 || direction[1] === 0) {
        if (pos[0] === 1) {
            if (nextPos[0] === 2) {
                direction[0] = 0
                direction[1] = -1
            } else if (nextPos[0] === 3) {
                direction[0] = 0
                direction[1] = -1
            } else if (nextPos[0] === 4) {
                direction[0] = 0
                direction[1] = -1
            } else if (nextPos[0] === 5) {
                direction[0] = 0
                direction[1] = -1
            }
        } else if (pos[0] === 2) {
            if (nextPos[0] === 1) {
                direction[0] = -1
                direction[1] = 0
            } else if (nextPos[0] === 3) {
                direction[0] = -1
                direction[1] = 0
            } else if (nextPos[0] === 4) {
                direction[0] = -1
                direction[1] = 0
            } else if (nextPos[0] === 6) {
                direction[0] = -1
                direction[1] = 0
            }
        } else if (pos[0] === 3) {
            if (nextPos[0] === 1) {
                direction[0] = 0
                direction[1] = -1

            } else if (nextPos[0] === 2) {
                direction[0] = -1
                direction[1] = 0

            } else if (nextPos[0] === 5) {
                direction[0] = -1
                direction[1] = 0

            } else if (nextPos[0] === 6) {
                direction[0] = 0
                direction[1] = -1
            }
        } else if (pos[0] === 4) {
            if (nextPos[0] === 1) {
                direction[0] = 0
                direction[1] = 1

            } else if (nextPos[0] === 2) {
                direction[0] = 1
                direction[1] = 0

            } else if (nextPos[0] === 5) {
                direction[0] = 1
                direction[1] = 0

            } else if (nextPos[0] === 6) {
                direction[0] = 0
                direction[1] = 1
            }
        }

        if (pos[0] === 5) {
            if (nextPos[0] === 1) {
                direction[0] = 1
                direction[1] = 0
            } else if (nextPos[0] === 3) {
                direction[0] = 1
                direction[1] = 0
            } else if (nextPos[0] === 4) {
                direction[0] = 1
                direction[1] = 0
            } else if (nextPos[0] === 6) {
                direction[0] = 1
                direction[1] = 0
            }
        }

        if (pos[0] === 6) {
            if (nextPos[0] === 2) {
                direction[0] = 0
                direction[1] = 1
            } else if (nextPos[0] === 3) {
                direction[0] = 0
                direction[1] = 1
            } else if (nextPos[0] === 4) {
                direction[0] = 0
                direction[1] = 1
            } else if (nextPos[0] === 5) {
                direction[0] = 0
                direction[1] = 1
            }
        }
    }
}

function transformDirection(direction, nextPos, pos) {
    transformDirectionDiagonal(pos, nextPos, direction);
    transformDirectionStraight(direction, pos, nextPos);
}

function crawlStraight(possibleTiles, pos, direction, pieceColor, canAttack, depth = 999) {
    if (depth === 0)
        return;


    const side = pos[0] - 1 // sides are from 1, 2, 3, 4, 5. -1 for
    const xPos = pos[1] + direction[0]
    const yPos = pos[2] + direction[1]

    let nextGameTile = gameBoard[side]?.[xPos]?.[yPos]
    if (!nextGameTile || nextGameTile === 0) {
        return;
    }

    let checkForPieces = resolveBoardTile(nextGameTile)
    if (!checkForPieces?.tile) {
        return;
    }

    const nextPos = checkForPieces.tile.split("_").map(val => +val)

    // check for pieces
    if (checkForPieces.hasPiece) {
        if (checkForPieces.piece.type[0] !== pieceColor && canAttack) {
            // color not the same and can attack

            possibleTiles.add(checkForPieces)
            return
        } else {
            // cannot move here cause same piece color
            return
        }
    }

    // no piece on tile
    if (nextGameTile.isBoardTile) {
        possibleTiles.add(nextGameTile)
        depth = depth - 1;
        crawlStraight(possibleTiles, nextPos, direction, pieceColor, canAttack, depth)
        return
    }

    possibleTiles.add(checkForPieces)
    // makes it possible to travel to diff. sides
    transformDirection(direction, nextPos, pos);

    depth = depth - 1;
    crawlStraight(possibleTiles, nextPos, direction, pieceColor, canAttack, depth)
}

function nextTile(position, direction) {
    const side = position[0] - 1
    const xPos = position[1] + direction[0]
    const yPos = position[2] + direction[1]
    const tile = gameBoard[side]?.[xPos]?.[yPos]

    if (!tile || tile === 0) {
        return null
    }

    return tile
}

function crawlKnight(possibleTiles, pos, direction, pieceColor, canAttack) {
    const stepDirection = [...direction]
    let currentPos = [...pos]

    for (let step = 0; step < 2; step++) {
        const previousPos = currentPos
        const nextRef = nextTile(currentPos, stepDirection)

        if (!nextRef) {
            return
        }

        if (!nextRef.isBoardTile) {
            const destPos = nextRef.tile.split("_").map((val) => +val)
            transformDirection(stepDirection, destPos, previousPos)
        }

        const resolved = resolveBoardTile(nextRef)
        if (!resolved?.tile) {
            return
        }

        currentPos = resolved.tile.split("_").map((val) => +val)
    }

    const perpendicularDirections = [
        [-stepDirection[1], stepDirection[0]],
        [stepDirection[1], -stepDirection[0]],
    ]

    for (const perpDirection of perpendicularDirections) {
        const knightTarget = resolveBoardTile(nextTile(currentPos, perpDirection))
        if (!knightTarget) {
            continue
        }

        if (knightTarget.hasPiece) {
            if (knightTarget.piece.type[0] !== pieceColor && canAttack) {
                possibleTiles.add(knightTarget)
            }
        } else {
            possibleTiles.add(knightTarget)
        }
    }
}

function crawlSingle(possibleTiles, pos, direction, pieceColor, canAttack, canMoveWithoutAttacking = true) {
    const next = resolveBoardTile(nextTile(pos, direction));
    if (!next) {
        return;
    }

    if (next.hasPiece) {
        if (next.piece.type[0] !== pieceColor && canAttack) {
            possibleTiles.add(next)
        }
    } else if (canMoveWithoutAttacking) {
        possibleTiles.add(next)
    }
}



function singleStraight(gameBoardTile, canAttack) {
    let possibleTiles = new Set();
    let pieceColor = gameBoardTile.piece.type[0]
    const pos = gameBoardTile.tile.split("_").map(val => +val)
    crawlSingle(possibleTiles, pos, [-1, 0], pieceColor, canAttack) // left
    crawlSingle(possibleTiles, pos, [1, 0], pieceColor, canAttack)  // right
    crawlSingle(possibleTiles, pos, [0, 1], pieceColor, canAttack)  // up
    crawlSingle(possibleTiles, pos, [0, -1], pieceColor, canAttack) // down
    return possibleTiles
}



function singleMove(gameBoardTile, canAttack) {

    let possibleTiles = new Set();

    let pieceColor = gameBoardTile.piece.type[0]

    const pos = gameBoardTile.tile.split("_").map(val => +val)

    crawlSingle(possibleTiles, pos, [-1, 0], pieceColor, canAttack)
    crawlSingle(possibleTiles, pos, [-1, -1], pieceColor, canAttack)
    crawlSingle(possibleTiles, pos, [-1, 1], pieceColor, canAttack)

    crawlSingle(possibleTiles, pos, [1, 1], pieceColor, canAttack)
    crawlSingle(possibleTiles, pos, [1, -1], pieceColor, canAttack)
    crawlSingle(possibleTiles, pos, [1, 0], pieceColor, canAttack)

    crawlSingle(possibleTiles, pos, [0, -1], pieceColor, canAttack)
    crawlSingle(possibleTiles, pos, [0, 1], pieceColor, canAttack)

    return possibleTiles
}


function diagonalSingleAttack(gameBoardTile) {
    let possibleTiles = new Set();
    let pieceColor = gameBoardTile.piece.type[0]
    const pos = gameBoardTile.tile.split("_").map(val => +val)

    crawlSingle(possibleTiles, pos, [-1, -1], pieceColor, true, false)
    crawlSingle(possibleTiles, pos, [1, 1], pieceColor, true, false)
    crawlSingle(possibleTiles, pos, [-1, 1], pieceColor, true, false)
    crawlSingle(possibleTiles, pos, [1, -1], pieceColor, true, false)

    return possibleTiles
}

const typeMoves = {
    "cross": (startTile) => {
        const pos = startTile.tile.split("_").map(val => +val)

        let possibleTiles = new Set();

        let pieceColor = startTile.piece.type[0]

        crawlStraight(possibleTiles, pos, [0, 1], pieceColor, true)
        crawlStraight(possibleTiles, pos, [0, -1], pieceColor, true)
        crawlStraight(possibleTiles, pos, [1, 0], pieceColor, true)
        crawlStraight(possibleTiles, pos, [-1, 0], pieceColor, true)

        return possibleTiles
    },
    "diagonal": (startTile) => {

        const pos = startTile.tile.split("_").map(val => +val)

        let possibleTiles = new Set();

        let pieceColor = startTile.piece.type[0]

        crawlStraight(possibleTiles, pos, [-1, -1], pieceColor, true)
        crawlStraight(possibleTiles, pos, [-1, 1], pieceColor, true)
        crawlStraight(possibleTiles, pos, [1, 1], pieceColor, true)
        crawlStraight(possibleTiles, pos, [1, -1], pieceColor, true)

        return possibleTiles
    },
    "knight": (startTile) => {
        let possibleTiles = new Set();

        let pieceColor = startTile.piece.type[0]

        const pos = startTile.tile.split("_").map(val => +val)
        crawlKnight(possibleTiles, pos, [1, 0], pieceColor, true)
        crawlKnight(possibleTiles, pos, [-1, 0], pieceColor, true)
        crawlKnight(possibleTiles, pos, [0, 1], pieceColor, true)
        crawlKnight(possibleTiles, pos, [0, -1], pieceColor, true)

        return possibleTiles
    },
    "single": (startTile) => {
        return singleMove(startTile, false);
    },
    "singleStraight": (startTile) => {
        return singleStraight(startTile, false)
    },
    "singleAttack": (startTile) => {
        return singleMove(startTile, true);
    },
    "diagonalAttack": (startTile) => {
        return diagonalSingleAttack(startTile)
    },
    "doubleStart": (startTile) => {
        let possibleTiles = new Set();

        if (0 < startTile.piece.moves)
            return possibleTiles

        let pieceColor = startTile.piece.type[0]
        const pos = startTile.tile.split("_").map(val => +val)

        crawlStraight(possibleTiles, pos, [0, 1], pieceColor, true, 2)
        crawlStraight(possibleTiles, pos, [0, -1], pieceColor, true, 2)
        crawlStraight(possibleTiles, pos, [1, 0], pieceColor, true, 2)
        crawlStraight(possibleTiles, pos, [-1, 0], pieceColor, true, 2)

        return possibleTiles
    }

}

const pieceMoveInstructions = {
    "b": [
        typeMoves.diagonal
    ],
    "k": [
        typeMoves.singleAttack,
    ],
    "n": [
        typeMoves.knight
    ],
    "p": [
        typeMoves.singleStraight,
        typeMoves.diagonalAttack,
        typeMoves.doubleStart
    ],
    "q": [
        typeMoves.cross,
        typeMoves.diagonal
    ],
    "r": [
        typeMoves.cross
    ]
}

export function showPossibleMoves(tile) {
    const gameBoardTile = getGameBoardTileFromTile(tile)

    if (!gameBoardTile.hasPiece)
        return

    const pieceTypeNoColor = gameBoardTile.piece.type[1].toLowerCase() // b, k, n, p, q, r
    const moves = pieceMoveInstructions[pieceTypeNoColor]

    let allPossibleMoves = new Set();
    // move returns Sets.
    moves.forEach(move => {
        const possibleMoves = move(gameBoardTile)
        allPossibleMoves = new Set([...allPossibleMoves, ...possibleMoves])
    })

    allPossibleMoves.forEach(value => {
        displayHighlight(value.tile)
    })


    return allPossibleMoves
}


export function removeAllHighlights(highlightList) {
    highlightList.forEach(gameTile => {
        removeHighlight(gameTile.tile)
    })
}

function resetPieceMaterial(material) {
    material.blending = THREE.NormalBlending;
    material.opacity = 1;
    material.color.set(0xffffff);
}

function removeHighlight(tile) {
    const tileModel = scene.getObjectByName(`$:${tile}`);
    const gameTile = getGameBoardTileFromTile(tile);
    if (!tileModel) {
        return;
    }

    if (gameTile.hasPiece) {
        resetPieceMaterial(tileModel.material);
        hideCaptureOverlay(tileModel);
        return;
    }

    disposeMaterialMap(tileModel.material);
    tileModel.material.transparent = false;
    resetPieceMaterial(tileModel.material);
}

function displayHighlight(tile) {
    const model = scene.getObjectByName(`$:${tile}`);
    const gameBoardTile = getGameBoardTileFromTile(tile);
    if (!model) {
        return;
    }

    if (gameBoardTile.hasPiece) {
        resetPieceMaterial(model.material);
        showCaptureOverlay(model);
        return;
    }

    hideCaptureOverlay(model);
    assignTextureToMaterial(model.material, textures.highlight_1);
}

export function checkCheckmate(pieceColor, gameBoardKingTile) {
    console.log("is checking checkmate for , ", pieceColor , " king is on ," , gameBoardKingTile)

    console.log(gameBoardKingTile)

    let isInCheck = false

    typeMoves.cross(gameBoardKingTile).forEach(tile => {
        if (tile.hasPiece) {
            let piTy = tile.piece.type[1]
            if (piTy === 'Q' || piTy === 'R') {
                isInCheck = true
            }
        }

    });

    typeMoves.diagonal(gameBoardKingTile).forEach(tile => {
        if (tile.hasPiece) {
            let piTy = tile.piece.type[1]
            if (piTy === 'Q' || piTy === 'B') {
                isInCheck = true
            }
        }
    })

    typeMoves.knight(gameBoardKingTile).forEach(tile => {
        if (tile.hasPiece) {
            let piTy = tile.piece.type[1]
            if (piTy === 'N') {
                isInCheck = true
            }
        }
    })

    return isInCheck
}