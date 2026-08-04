const SIDE_BOARD_COLORS = [
    {light: '#fff7d2', dark: '#ffa22e'},
    {light: '#deffcb', dark: '#2bff1b'},
    {light: '#80b8ff', dark: '#0065ff'},
    {light: '#ffadc0', dark: '#ff4545'},
    {light: '#e176ff', dark: '#be59ff'},
    {light: '#d9fff2', dark: '#2efff5'},
];

const PREVIEW_ROTATION = {
    1: -Math.PI / 2,
    2: Math.PI,
    6: Math.PI / 2,
};

function applyPreviewRotation(ctx, size, sideNumber) {
    const rotation = PREVIEW_ROTATION[sideNumber];
    if (rotation === undefined) {
        return;
    }

    if (rotation === Math.PI) {
        ctx.translate(size, size);
        ctx.rotate(rotation);
        return;
    }

    if (rotation > 0) {
        ctx.translate(size, 0);
        ctx.rotate(rotation);
        return;
    }

    ctx.translate(0, size);
    ctx.rotate(rotation);
}

function getBoardTilesOnSide(gameBoard, sideNumber) {
    const face = gameBoard[sideNumber - 1];
    if (!face) {
        return [];
    }

    const pieces = [];

    for (const row of face) {
        if (!row) {
            continue;
        }

        for (const tile of row) {
            if (!tile?.isBoardTile || !tile.hasPiece) {
                continue;
            }

            const [, boardRow, boardCol] = tile.tile.split('_').map(Number);
            pieces.push({
                row: boardRow,
                col: boardCol,
                color: tile.piece.type[0],
            });
        }
    }

    return pieces;
}

function drawCheckerboard(ctx, size, palette) {
    const cellSize = size / 8;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const isEven = (row + col) % 2 === 0;
            ctx.fillStyle = isEven ? palette.light : palette.dark;
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
}

function drawPieceDots(ctx, size, pieces) {
    const cellSize = size / 8;

    for (const piece of pieces) {
        const cx = (piece.col - 1) * cellSize + cellSize / 2;
        const cy = (piece.row - 1) * cellSize + cellSize / 2;
        const radius = cellSize * 0.3;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = piece.color === 'w' ? '#ffffff' : '#1a1a1a';
        ctx.fill();
        ctx.strokeStyle = piece.color === 'w' ? '#4a4a4a' : '#e8e8e8';
        ctx.lineWidth = Math.max(1, cellSize * 0.1);
        ctx.stroke();
    }
}

export function drawSidePreview(canvas, sideNumber, gameBoard) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const size = canvas.width;
    const palette = SIDE_BOARD_COLORS[sideNumber - 1];
    const pieces = getBoardTilesOnSide(gameBoard, sideNumber);

    ctx.clearRect(0, 0, size, size);

    ctx.save();

    applyPreviewRotation(ctx, size, sideNumber);

    drawCheckerboard(ctx, size, palette);
    drawPieceDots(ctx, size, pieces);
    ctx.restore();
}

export function refreshAllSidePreviews(gameBoard, canvasesBySide) {
    for (const [sideNumber, canvas] of canvasesBySide.entries()) {
        drawSidePreview(canvas, sideNumber, gameBoard);
    }
}
