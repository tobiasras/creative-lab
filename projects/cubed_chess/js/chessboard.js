import * as THREE from "three";

const segmentSize = 3 / 8;

export function createBoard(scene) {
    const gameBoard = []

    for (let side = 0; side < 6; side++) {
        let boardFace = []

        for (let i = 0; i < 8; i++) {
            const row = []

            for (let j = 0; j < 8; j++) {

                const val = createTile(side, i, j)

                let tile = val[0];
                tile.name = `${side + 1}_${i + 1}_${j + 1}`
                scene.add(tile)

                let pieceContainer = val[1]
                pieceContainer.name = `$:${side + 1}_${i + 1}_${j + 1}`
                scene.add(pieceContainer)

                row.push({
                    isBoardTile: true,
                    tile: tile.name,
                    hasPiece: false,
                    piece: {},
                })
            }
            boardFace.push(row)
        }

        // creates the flaps for the board
        boardFace.unshift(rowFlaps[side](true))
        boardFace.push(rowFlaps[side](false))
        sideFlaps[side](boardFace);
        gameBoard.push(boardFace)
    }

    return gameBoard;
}

function createTile(side, i, j) {
    // 3d model
    const pieceContainerMaterial = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});

    const segmentMaterial = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
    const planeGeometry = new THREE.PlaneGeometry(segmentSize, segmentSize);

    const tile = new THREE.Mesh(planeGeometry);
    tile.material = segmentMaterial

    const pieceContainer = new THREE.Mesh(planeGeometry);
    pieceContainer.material = pieceContainerMaterial
    transformTile[side](pieceContainer, i, j)

    transformTile[side](tile, i, j, )

    colorTile[side](tile, (j + i) % 2 === 0)

    return [tile, pieceContainer];
}

const colorTile = [
    (tile, isEven) => {
        tile.material.color.set(isEven ? "#ffa22e" : "#fff7d2")
    },
    (tile, isEven) => {
        tile.material.color.set(isEven ? "#2bff1b" : "#deffcb")
    },
    (tile, isEven) => {
        tile.material.color.set(isEven ? "#0065ff" : "#80b8ff")
    },
    (tile, isEven) => {
        tile.material.color.set(isEven ? "#ff4545" : "#ffadc0")
    },
    (tile, isEven) => {
        tile.material.color.set(isEven ? "#be59ff" : "#e176ff")
    },
    (tile, isEven) => {
        tile.material.color.set(isEven ? "#2efff5" : "#d9fff2")
    },
]

const transformTile = [
    (tile, i, j, isEven) => {
        tile.rotation.x = 0;
        tile.position.set(
            (j - 4) * segmentSize + segmentSize / 2,
            (i - 4) * segmentSize + segmentSize / 2,
            1.5,
        );
    },
    (tile, i, j, isEven) => {
        tile.rotation.z = -Math.PI / 2;
        tile.rotation.x = Math.PI / 2;
        tile.position.set(
            (i - 4) * segmentSize + segmentSize / 2,
            1.5,
            (j - 4) * segmentSize + segmentSize / 2
        );
    },
    (tile, i, j, isEven) => {
        tile.rotation.y = Math.PI / 2;
        tile.position.set(
            1.5,
            (i - 4) * segmentSize + segmentSize / 2,
            (j - 4) * segmentSize + segmentSize / 2
        );
    },
    (tile, i, j, isEven) => {
        tile.rotation.y = Math.PI / 2;
        tile.position.set(
            -1.5,
            (i - 4) * segmentSize + segmentSize / 2,
            (j - 4) * segmentSize + segmentSize / 2
        );
    },
    (tile, i, j, isEven) => {
        tile.rotation.z = Math.PI / 2;
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(
            (i - 4) * segmentSize + segmentSize / 2,
            -1.5,
            (j - 4) * segmentSize + segmentSize / 2
        );
    },
    (tile, i, j, isEven) => {
        tile.rotation.x = 0;
        tile.position.set(
            (j - 4) * segmentSize + segmentSize / 2,
            (i - 4) * segmentSize + segmentSize / 2,
            -1.5,
        );
    },
]

// Creating gameboard
let rowFlaps = [
    (isFirst) => {
        if (isFirst) {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `5_${i + 1}_8`,
                })
            }
            tiles.push(0)
            return tiles
        } else {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `2_${i + 1}_8`,
                })
            }
            tiles.push(0)
            return tiles
        }
    },
    (isFirst) => {
        if (isFirst) {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `4_8_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        } else {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `3_8_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        }
    },
    (isFirst) => {
        if (isFirst) {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `5_8_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        } else {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `2_8_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        }
    },
    (isFirst) => {
        if (isFirst) {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `5_1_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        } else {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `2_1_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        }
    },
    (isFirst) => {
        if (isFirst) {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `4_1_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        } else {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `3_1_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        }
    },
    (isFirst) => {
        if (isFirst) {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile:`5_${i + 1}_1` //`5_1_${i + 1}`,
                })
            }
            tiles.push(0)
            return tiles
        } else {
            let tiles = [0]
            for (let i = 0; i < 8; i++) {
                tiles.push({
                    isBoardTile: false,
                    tile: `2_${i + 1}_1`,
                })
            }
            tiles.push(0)
            return tiles
        }
    }
]

let sideFlaps = [
    (boardFace) => {
        // Orange side
        for (let i = 1; i < 9; i++) {
            boardFace[i].unshift({
                isBoardTile: false,
                tile: `4_${i}_8`,
            })

            boardFace[i].push({
                isBoardTile: false,
                tile: `3_${i}_8`,
            })
        }
    },
    (boardFace) => {
        // Green side
        for (let i = 1; i < 9; i++) {
            boardFace[i].unshift({
                isBoardTile: false,
                tile: `6_8_${i}`,
            })
            boardFace[i].push({
                isBoardTile: false,
                tile: `1_8_${i}`,
            })
        }
    },
    (boardFace) => {
        // Blue side
        for (let i = 1; i < 9; i++) {
            boardFace[i].unshift({
                isBoardTile: false,
                tile: `6_${i}_8`,
            })
            boardFace[i].push({
                isBoardTile: false,
                tile: `1_${i}_8`,
            })
        }
    },
    (boardFace) => {
        // Red side
        for (let i = 1; i < 9; i++) {
            boardFace[i].unshift({
                isBoardTile: false,
                tile: `6_${i}_1`,
            })
            boardFace[i].push({
                isBoardTile: false,
                tile: `1_${i}_1`,
            })
        }
    },
    (boardFace) => {
        // Purple
        for (let i = 1; i < 9; i++) {
            boardFace[i].unshift({
                isBoardTile: false,
                tile: `6_1_${i}`,
            })
            boardFace[i].push({
                isBoardTile: false,
                tile: `1_1_${i}`,
            })
        }
    },
    (boardFace) => {
        // Turquoise
        for (let i = 1; i < 9; i++) {
            boardFace[i].unshift({
                isBoardTile: false,
                tile: `4_${i}_1`,
            })
            boardFace[i].push({
                isBoardTile: false,
                tile: `3_${i}_1`,
            })
        }
    },
]




