import {drawSidePreview} from './navBoard.js';
import {focusCameraOnSide} from './threeSettings.js';

export class UIController {
    constructor() {
        this.slideMenu = document.getElementById('slideMenu')
        this.menuToggles = document.getElementsByClassName("menu-toggle")
        this.playerTurn = document.getElementById("player-turn")
        this.sideButtons = document.querySelectorAll('.side')
        this.canvasesBySide = new Map()

        this.setupMenuBtn()
        this.setupNav()
        this.setupStartGameBtn()
    }

    setNormalStartFunc(normalStartFunc) {
        this.normalStartFunc = normalStartFunc
    }

    setFreePlayStartFunc(freeStartFunc) {
        this.freeStartFunc = freeStartFunc
    }

    setupMenuBtn() {
        Array.from(this.menuToggles).forEach(menu => {
            menu.addEventListener('click', (e) => {
                e.preventDefault();
                this.slideMenu?.classList.toggle('open');
            })
        })
    }

    setupStartGameBtn() {
        this.normalPlayBtn = document.getElementById("start-normal-play")
        this.freePlayBtn = document.getElementById("free-play")

        this.normalPlayBtn?.addEventListener("click", () => {
            this.prepareTurnUI(true)
            this.normalStartFunc?.()
        })

        this.freePlayBtn?.addEventListener("click", () => {
            this.prepareTurnUI(false)
            this.freeStartFunc?.()
        })
    }

    prepareTurnUI(showTurnIndicator) {
        this.playerTurn.hidden = !showTurnIndicator
        if (showTurnIndicator) {
            const turnLabel = this.playerTurn.querySelector('p')
            if (turnLabel) {
                turnLabel.innerText = "White's turn"
            }
            this.playerTurn.classList.remove('open')
        }
    }

    switchPlayerTurn() {
        const whitePiecesText = "White's turn"
        const blackPiecesText = "Black's turn"
        const turnLabel = this.playerTurn.querySelector('p')
        if (!turnLabel) {
            return
        }
        if (turnLabel.innerText === whitePiecesText) {
            turnLabel.innerText = blackPiecesText
        } else {
            turnLabel.innerText = whitePiecesText
        }
        this.playerTurn.classList.toggle('open');
    }

    getSideNumberFromButton(button) {
        const match = [...button.classList].find((name) => name.startsWith('side-') && name !== 'side')
        if (!match) {
            return null
        }

        return Number.parseInt(match.replace('side-', ''), 10)
    }

    resizeSideCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();
        const size = Math.max(1, Math.floor(Math.min(rect.width, rect.height)));
        canvas.width = size;
        canvas.height = size;
    }

    setupNav() {
        this.canvasesBySide.clear();

        this.sideButtons.forEach((button) => {
            const sideNumber = this.getSideNumberFromButton(button);
            const canvas = button.querySelector('.side-canvas');

            if (!sideNumber || !canvas) {
                return;
            }

            this.canvasesBySide.set(sideNumber, canvas);
            this.resizeSideCanvas(canvas);

            button.addEventListener('click', (event) => {
                event.stopPropagation();
                focusCameraOnSide(sideNumber);
            });
        });

        window.addEventListener('resize', () => {
            for (const [sideNumber, canvas] of this.canvasesBySide.entries()) {
                this.resizeSideCanvas(canvas);
                if (this.latestGameBoard) {
                    drawSidePreview(canvas, sideNumber, this.latestGameBoard);
                }
            }
        });
    }

    refreshSideNav(gameBoard) {
        this.latestGameBoard = gameBoard;

        for (const [sideNumber, canvas] of this.canvasesBySide.entries()) {
            this.resizeSideCanvas(canvas);
            drawSidePreview(canvas, sideNumber, gameBoard);
        }
    }
}
