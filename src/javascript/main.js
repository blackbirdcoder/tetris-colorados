const scene = document.getElementById('scene');
const score = document.getElementById('score');
const record = document.getElementById('record');
const line = document.getElementById('line');
const level = document.getElementById('level');
const nextFigureBox = document.getElementById('nextFigure');
const btnPause = document.getElementById('pause');
const windowGameOver = document.getElementById('windowGameOver');
const gameOverScore = document.getElementById('gameOverScore');
const gameOverLine = document.getElementById('gameOverLine');
const gameOverRecord = document.getElementById('gameOverRecord');
const windowGameWin = document.getElementById('windowGameWin');
const buttonsNewGame = document.getElementsByClassName('btnNewGame');
const gameWinRecord = document.getElementById('gameWinRecord');
const gameWinLine = document.getElementById('gameWinLine');
const gameWinScore = document.getElementById('gameWinScore');
const gameWinLevel = document.getElementById('gameWinLevel');

const settings = {
    scene: {
        notation: {
            free: 0,
            busy: 1,
            fixed: 2,
        },
        nameCssClasses: {
            moving: 'moving-cell',
            fixed: 'fixed-cell',
            cellPreview: 'cell-preview',
            cellBackground: 'cell-bg',
            cell: 'cell',
        },
        line: 10,
    },
    keyboard: {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space: 32,
    },
    figures: {
        O: [
            [1, 1],
            [1, 1],
        ],
        I: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        L: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        J: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],

        T: [
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 0],
        ],
    },
    speed: 500,
    initialProgress: {
        score: 0,
        record: 0,
        line: 0,
        level: 0,
    },
    levels: {
        1: { line: 20, value: 1, speed: 450 },
        2: { line: 40, value: 2, speed: 400 },
        3: { line: 60, value: 3, speed: 350 },
        4: { line: 80, value: 4, speed: 300 },
        5: { line: 100, value: 5, speed: 250 },
        6: { line: 120, value: 6, speed: 200 },
        7: { line: 140, value: 7, speed: 150 },
    },
};

const state = {
    pause: false,
    SceneStyle: scene,
    timerId: null,
    playingField: null,
    activeFigure: null,
    restProgress: null,
    gameOver: windowGameOver,
    gameWin: windowGameWin,
};

const winner = {
    record: gameWinRecord,
    line: gameWinLine,
    score: gameWinScore,
    level: gameWinLevel,
};

const loser = {
    record: gameOverRecord,
    line: gameOverLine,
    score: gameOverScore,
};

function Figure(figures) {
    this._figures = figures;

    this.getRandomFigure = function () {
        const nameFigures = Object.keys(this._figures);
        const randomNumber = Math.floor(Math.random() * nameFigures.length);
        const randomFigure = this._figures[nameFigures[randomNumber]];
        return { shape: randomFigure, positionX: Math.floor((10 - randomFigure[0].length) / 2), positionY: 0 };
    }.bind(this);
}

function Scene(scene, options, callbackFigureRandom) {
    this._scene = scene;
    this._options = options;
    this._matrix = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    this._currentFigure = callbackFigureRandom();
    this._activeFigure = {
        y: this._currentFigure.positionY,
        x: this._currentFigure.positionX,
        shape: this._currentFigure.shape,
    };
    this._progress = {
        score: 0,
        line: 0,
    };

    this.render = function () {
        this._scene.innerHTML = '';
        const setCells = [];
        this._matrix.forEach((row) => {
            row.forEach((cell) => {
                const div = document.createElement('div');
                if (cell === this._options.notation.busy) {
                    div.classList.add(this._options.nameCssClasses.cell, this._options.nameCssClasses.moving);
                } else if (cell === this._options.notation.fixed) {
                    div.classList.add(this._options.nameCssClasses.cell, this._options.nameCssClasses.fixed);
                } else {
                    div.classList.add(this._options.nameCssClasses.cell);
                }
                setCells.push(div);
            });
        });
        this._scene.append(...setCells);
    };

    this._collisionCheck = function () {
        for (let rowIdx = 0; rowIdx < this._activeFigure.shape.length; rowIdx++) {
            for (let cellIdx = 0; cellIdx < this._activeFigure.shape[rowIdx].length; cellIdx++) {
                if (
                    this._activeFigure.shape[rowIdx][cellIdx] === this._options.notation.busy &&
                    (this._matrix[this._activeFigure.y + rowIdx] === undefined ||
                        this._matrix[this._activeFigure.y + rowIdx][this._activeFigure.x + cellIdx] === undefined ||
                        this._matrix[this._activeFigure.y + rowIdx][this._activeFigure.x + cellIdx] ===
                            this._options.notation.fixed)
                ) {
                    return true;
                }
            }
        }
        return false;
    };

    this._removeOldActiveFigure = function () {
        this._matrix.forEach((row, rowIdx) => {
            row.forEach((cell, cellIdx) => {
                if (cell === this._options.notation.busy) {
                    this._matrix[rowIdx][cellIdx] = this._options.notation.free;
                }
            });
        });
    };

    this.addActiveFigure = function () {
        this._removeOldActiveFigure();
        for (let rowIdx = 0; rowIdx < this._activeFigure.shape.length; rowIdx++) {
            for (let cellIdx = 0; cellIdx < this._activeFigure.shape[rowIdx].length; cellIdx++) {
                if (this._activeFigure.shape[rowIdx][cellIdx] === this._options.notation.busy) {
                    this._matrix[this._activeFigure.y + rowIdx][this._activeFigure.x + cellIdx] =
                        this._activeFigure.shape[rowIdx][cellIdx];
                }
            }
        }
    };

    this._removeFullLines = function () {
        let counterLine = 0;
        for (let rowIdx = 0; rowIdx < this._matrix.length; rowIdx++) {
            let canRemoveLine = true;
            for (let cellIdx = 0; cellIdx < this._matrix[rowIdx].length; cellIdx++) {
                if (this._matrix[rowIdx][cellIdx] !== this._options.notation.fixed) {
                    canRemoveLine = false;
                    break;
                }
            }

            if (canRemoveLine) {
                this._matrix.splice(rowIdx, 1);
                this._matrix.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                canRemoveLine = false;
                this._progress.score += 10;
                this._progress.line += 1;
                ++counterLine;
                this.render();
            }
        }

        switch (counterLine) {
            case 2:
                this._progress.score *= 2;
                break;
            case 3:
                this._progress.score *= 3;
                break;
            case 4:
                this._progress.score *= 4;
                break;
        }
    };

    this._fixed = function () {
        for (let rowIdx = this._matrix.length - 1; rowIdx >= 0; rowIdx--) {
            this._matrix[rowIdx].forEach((cell, cellIdx) => {
                if (cell === this._options.notation.busy) {
                    this._matrix[rowIdx][cellIdx] = this._options.notation.fixed;
                }
            });
        }

        this._removeFullLines();
    };

    this._rotate = function () {
        const saveShape = this._activeFigure.shape;
        this._activeFigure.shape = this._activeFigure.shape[0].map((item, itemIdx) =>
            this._activeFigure.shape.map((row) => row[itemIdx]).reverse()
        );

        if (this._collisionCheck()) {
            this._activeFigure.shape = saveShape;
        }
    };

    this._fastDown = function () {
        for (let rowIdx = this._activeFigure.y; rowIdx < this._matrix.length; rowIdx++) {
            this._activeFigure.y += 1;
            if (this._collisionCheck()) {
                this._activeFigure.y -= 1;
                break;
            }
        }
    };

    this.getKitScene = function () {
        return {
            matrix: this._matrix,
            options: this._options,
            render: this.render.bind(this),
            addActiveFigure: this.addActiveFigure.bind(this),
            activeFigure: this._activeFigure,
            collisionCheck: this._collisionCheck.bind(this),
            fixed: this._fixed.bind(this),
            rotate: this._rotate.bind(this),
            progress: this._progress,
            activeFigure: this._activeFigure,
            fastDown: this._fastDown.bind(this),
        };
    };
}

function Control(
    keyboard,
    kitScene,
    state,
    windowGameOver,
    loser,
    callbackProcessedRecord,
    callbackPlayerProgress,
    callbackFigureRandom,
    callbackFigureNextPreview
) {
    this._keyboard = keyboard;
    this._kitScene = kitScene;
    this._nextFigure = callbackFigureNextPreview(callbackFigureRandom());

    this.forwardDown = function () {
        if (!state.pause) {
            this._kitScene.activeFigure.y += 1;
            if (this._kitScene.collisionCheck()) {
                const currentFigure = this._nextFigure;
                this._kitScene.activeFigure.y -= 1;
                this._kitScene.fixed();
                this._kitScene.activeFigure.x = currentFigure.positionX;
                this._kitScene.activeFigure.shape = currentFigure.shape;
                this._kitScene.activeFigure.y = currentFigure.positionY;
                if (this._kitScene.collisionCheck()) {
                    callbackProcessedRecord();
                    windowGameOver.style.display = 'flex';
                    const playerProgress = callbackPlayerProgress();
                    loser.record.textContent = playerProgress.record;
                    loser.score.textContent = playerProgress.score;
                    loser.line.textContent = playerProgress.line;
                }
                this._nextFigure = callbackFigureNextPreview(callbackFigureRandom());
            }
        }
    };

    this.keyboardActivation = function () {
        addEventListener('keydown', (event) => {
            if (!state.pause) {
                switch (event.keyCode) {
                    case this._keyboard.left:
                        this._kitScene.activeFigure.x -= 1;
                        if (this._kitScene.collisionCheck()) {
                            this._kitScene.activeFigure.x += 1;
                        }
                        break;
                    case this._keyboard.up:
                        this._kitScene.rotate();
                        break;
                    case this._keyboard.right:
                        this._kitScene.activeFigure.x += 1;
                        if (this._kitScene.collisionCheck()) {
                            this._kitScene.activeFigure.x -= 1;
                        }
                        break;
                    case this._keyboard.down:
                        this.forwardDown();
                        break;
                    case this._keyboard.space:
                        this._kitScene.fastDown();
                        break;
                }
                this._kitScene.addActiveFigure();
                this._kitScene.render();
            }
        });
    };

    this.pause = function () {
        state.pause = !state.pause;
        state.SceneStyle.style = state.pause ? 'filter: brightness(0.7);' : 'filter: none;';
    };

    this.newGame = function () {
        const resetZero = 0;
        for (let rowIdx = 0; rowIdx < state.playingField.length; rowIdx++) {
            for (let cellIdx = 0; cellIdx < state.playingField[rowIdx].length; cellIdx++) {
                state.playingField[rowIdx][cellIdx] = resetZero;
            }
        }
        state.activeFigure.y = resetZero;
        state.pause = Boolean(resetZero);
        state.SceneStyle.style = 'filter: none;';
        state.restProgress();
        state.gameOver.style.display = 'none';
        state.gameWin.style.display = 'none';
    };
}

function Dashboard(score, record, line, level, next, initial, levels, notations, nameCssClasses, winner) {
    this._score = score;
    this._record = record;
    this._line = line;
    this._level = level;
    this._nextFigureBox = next;
    this._progress = null;

    this._playerProgress = initial;
    this._levels = levels;

    this.processRecord = function () {
        if (localStorage.record === undefined) localStorage.record = 0;

        if (Number(localStorage.record) < this._playerProgress.score) {
            localStorage.record = this._playerProgress.score;
            this._playerProgress.record = Number(localStorage.record);
        }
    }.bind(this);

    this.restProgress = function () {
        const resetZero = 0;
        for (let key in this._playerProgress) {
            if (key !== 'record') {
                this._playerProgress[key] = resetZero;
            }
        }
        for (let key in this._progress) {
            this._progress[key] = resetZero;
        }
        this.displaying();
    }.bind(this);

    this.displaying = function () {
        this._score.textContent = this._playerProgress.score;
        this._record.textContent = this._playerProgress.record;
        this._line.textContent = this._playerProgress.line;
        this._level.textContent = this._playerProgress.level;
    };

    this._levelUp = function (lvl) {
        this._playerProgress.level = lvl;
        this._level.textContent = this._playerProgress.level;
    };

    this.achievementHandler = function (progress) {
        this._progress = progress;
        if (this._playerProgress.score < progress.score) {
            this._playerProgress.score = progress.score;
            this._score.textContent = this._playerProgress.score;
        } else if (this._playerProgress.line <= progress.line) {
            if (progress.line >= levels[1].line && progress.line < levels[2].line) {
                this._levelUp(levels[1].value);
                settings.speed = levels[1].speed;
            } else if (progress.line >= levels[2].line && progress.line < levels[3].line) {
                this._levelUp(levels[2].value);
                settings.speed = levels[2].speed;
            } else if (progress.line >= levels[3].line && progress.line < levels[4].line) {
                this._levelUp(levels[3].value);
                settings.speed = levels[3].speed;
            } else if (progress.line >= levels[4].line && progress.line < levels[5].line) {
                this._levelUp(levels[4].value);
                settings.speed = levels[4].speed;
            } else if (progress.line >= levels[5].line && progress.line < levels[6].line) {
                this._levelUp(levels[5].value);
                settings.speed = levels[5].speed;
            } else if (progress.line >= levels[6].line && progress.line < levels[7].line) {
                this._levelUp(levels[6].value);
                settings.speed = levels[6].speed;
            } else if (progress.line >= levels[7].line) {
                this._levelUp(levels[7].value);
                console.log('YOU WIN!');
                windowGameWin.style.display = 'flex';
                state.gameOver.style.display = 'none';
                state.pause = true;
                winner.record.textContent = this._playerProgress.record;
                winner.line.textContent = this._playerProgress.line;
                winner.score.textContent = this._playerProgress.score;
                winner.level.textContent = levels[7].line;
            }
            this._playerProgress.line = progress.line;
            this._line.textContent = this._playerProgress.line;
        }
        this._record.textContent = this._playerProgress.record;
    };

    this.dataStorageCheck = function () {
        if (localStorage.record !== undefined) {
            this._playerProgress.record = Number(localStorage.record);
        }
    };

    this.figureNextPreview = function (figure) {
        switch (figure.shape.length) {
            case 2:
                this._nextFigureBox.style.width = '40px';
                this._nextFigureBox.style.height = '40px';
                break;
            case 3:
                this._nextFigureBox.style.width = '70px';
                this._nextFigureBox.style.height = '50px';
                break;
            case 4:
                this._nextFigureBox.style.width = '80px';
                this._nextFigureBox.style.height = '80px';
                break;
        }

        this._nextFigureBox.innerHTML = '';
        const setCells = [];
        figure.shape.forEach((row) => {
            row.forEach((cell) => {
                const div = document.createElement('div');
                if (cell === notations.busy) {
                    div.classList.add(nameCssClasses.cellPreview, nameCssClasses.cellBackground);
                } else if (cell === notations.free) {
                    div.classList.add(nameCssClasses.cellPreview);
                }
                setCells.push(div);
            });
        });
        this._nextFigureBox.append(...setCells);
        return figure;
    }.bind(this);

    this.getPlayerProgress = function () {
        return this._playerProgress;
    }.bind(this);
}

(function main() {
    const dashboard = new Dashboard(
        score,
        record,
        line,
        level,
        nextFigureBox,
        settings.initialProgress,
        settings.levels,
        settings.scene.notation,
        settings.scene.nameCssClasses,
        winner
    );
    dashboard.displaying();
    dashboard.dataStorageCheck();
    const figure = new Figure(settings.figures);
    const gameScene = new Scene(scene, settings.scene, figure.getRandomFigure);
    const kitScene = gameScene.getKitScene();
    const control = new Control(
        settings.keyboard,
        kitScene,
        state,
        windowGameOver,
        loser,
        dashboard.processRecord,
        dashboard.getPlayerProgress,
        figure.getRandomFigure,
        dashboard.figureNextPreview
    );
    control.keyboardActivation();
    btnPause.addEventListener('click', control.pause);
    for (button of buttonsNewGame) {
        button.addEventListener('click', control.newGame);
    }

    gameScene.addActiveFigure();
    gameScene.render();

    function gameLoop() {
        control.forwardDown();
        gameScene.addActiveFigure();
        gameScene.render();
        dashboard.achievementHandler(kitScene.progress);
        state.playingField = kitScene.matrix;
        state.activeFigure = kitScene.activeFigure;
        state.restProgress = dashboard.restProgress;
        setTimeout(gameLoop, settings.speed);
    }

    state.timerId = setTimeout(gameLoop, settings.speed);
})();
