// --- Získání prvků z HTML ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const targetScoreElement = document.getElementById('target-score');
const levelCompleteScreen = document.getElementById('level-complete-screen');
const gameCompleteScreen = document.getElementById('game-complete-screen'); // NOVÉ
const controlsOverlay = document.getElementById('controls-overlay');
const nextLevelBtn = document.getElementById('next-level-btn');
const resetProgressBtn = document.getElementById('reset-progress-btn'); // NOVÉ
const playAgainBtn = document.getElementById('play-again-btn'); // NOVÉ

// --- Nastavení hry a levelů ---
const box = 20;
const gridSizeX = canvas.width / box;
const gridSizeY = canvas.height / box;
const FOOD_COUNT = 3;
const SAVE_KEY = 'snakeGameSave';

const levels = {
    1: { target: 15, speed: 200 }, 
    2: { target: 20, speed: 200 },
    3: { target: 25, speed: 170 }, 
    4: { target: 30, speed: 170 },
    5: { target: 40, speed: 150 }
};
const maxLevel = Object.keys(levels).length;

let snake, direction, score, game;
let foods = [];
let currentLevel = 1;

// --- Uložení a načtení hry (LocalStorage) ---
function saveGame() { localStorage.setItem(SAVE_KEY, currentLevel); }
function loadGame() {
    const savedLevel = parseInt(localStorage.getItem(SAVE_KEY));
    if (savedLevel && levels[savedLevel]) { currentLevel = savedLevel; }
}

// NOVÉ: Funkce pro resetování postupu
function resetProgressAndReload() {
    if (confirm("Opravdu chcete smazat veškerý postup a začít od levelu 1?")) {
        localStorage.removeItem(SAVE_KEY);
        document.location.reload();
    }
}

// --- Hlavní funkce ---
function resetGame() {
    levelCompleteScreen.classList.remove('visible');
    gameCompleteScreen.classList.remove('visible');
    controlsOverlay.classList.remove('hidden');
    
    snake = [];
    snake[0] = { x: 10 * box, y: 10 * box };
    direction = null;
    score = 0;
    
    updateScoreDisplay();
    foods = [];
    for (let i = 0; i < FOOD_COUNT; i++) { addFood(); }
    
    clearInterval(game);
    game = null;
    drawStaticElements();
}

function addFood() {
    foods.push({
        x: Math.floor(Math.random() * gridSizeX) * box,
        y: Math.floor(Math.random() * gridSizeY) * box
    });
}

function updateScoreDisplay() {
    levelElement.innerText = currentLevel;
    scoreElement.innerText = score;
    targetScoreElement.innerText = levels[currentLevel].target;
}

// --- Vykreslovací funkce ---
function drawStaticElements() {
    ctx.fillStyle = '#a7d948';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawSnake();
    foods.forEach(food => drawApple(food));
}

function gameLoop() {
    let snakeX = snake[0].x; let snakeY = snake[0].y;
    if (direction === 'LEFT') snakeX -= box; 
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box; 
    if (direction === 'DOWN') snakeY += box;

    const eatenAppleIndex = foods.findIndex(food => snakeX === food.x && snakeY === food.y);

    if (eatenAppleIndex > -1) {
        score++;
        updateScoreDisplay();
        document.querySelector('.score-board').classList.add('score-eaten');
        setTimeout(() => document.querySelector('.score-board').classList.remove('score-eaten'), 200);

        if (score >= levels[currentLevel].target) {
            showLevelCompleteScreen(); return;
        }
        foods.splice(eatenAppleIndex, 1); addFood();
    } else { snake.pop(); }

    const newHead = { x: snakeX, y: snakeY };
    if (collision(newHead, snake)) {
        clearInterval(game); alert('Konec hry! Tvoje skóre: ' + score);
        resetGame(); return;
    }
    snake.unshift(newHead);

    ctx.fillStyle = '#a7d948'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(); drawSnake();
    foods.forEach(food => drawApple(food));
}

function drawGrid() { /* ... kód pro mřížku ... */ }
function drawSnake() { /* ... kód pro hada ... */ }
function drawApple(food) { /* ... kód pro jablko ... */ }
function collision(head, array) { /* ... kód pro kolizi ... */ }
// (Funkce drawGrid, drawSnake, drawApple, collision se nemění, pro zkrácení jsou zde vynechány, v kódu je musíš mít!)
// Zde jsou pro jistotu znovu:
function drawGrid() {
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    for (let x = 0; x <= canvas.width; x += box) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= canvas.height; y += box) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
}
function drawSnake() {
    ctx.fillStyle = '#005500'; ctx.fillRect(snake[0].x, snake[0].y, box, box);
    ctx.fillStyle = '#008000';
    for (let i = 1; i < snake.length; i++) { ctx.fillRect(snake[i].x, snake[i].y, box, box); }
}
function drawApple(food) {
    ctx.fillStyle = '#d92c2c'; ctx.beginPath();
    ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI); ctx.fill();
}
function collision(head, array) {
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return true;
    for (let i = 0; i < array.length; i++) { if (head.x === array[i].x && head.y === array[i].y) return true; }
    return false;
}

// ZMĚNA: Logika pro zobrazení správné obrazovky
function showLevelCompleteScreen() {
    clearInterval(game); game = null;

    if (currentLevel === maxLevel) {
        // Hráč dokončil poslední level
        gameCompleteScreen.classList.add('visible');
    } else {
        // Hráč postupuje do dalšího levelu
        currentLevel++;
        saveGame();
        levelCompleteScreen.classList.add('visible');
    }
}

// --- Ovládání a spuštění ---
document.addEventListener('keydown', e => {
    const keyCode = e.keyCode; let newDirection = direction;
    if (keyCode === 37 && direction !== 'RIGHT') { newDirection = 'LEFT'; }
    else if (keyCode === 38 && direction !== 'DOWN') { newDirection = 'UP'; }
    else if (keyCode === 39 && direction !== 'LEFT') { newDirection = 'RIGHT'; }
    else if (keyCode === 40 && direction !== 'UP') { newDirection = 'DOWN'; }
    if (!game && newDirection) {
        controlsOverlay.classList.add('hidden');
        game = setInterval(gameLoop, levels[currentLevel].speed);
    }
    direction = newDirection;
});

nextLevelBtn.addEventListener('click', resetGame);
resetProgressBtn.addEventListener('click', resetProgressAndReload); // NOVÉ
playAgainBtn.addEventListener('click', () => { // NOVÉ
    localStorage.removeItem(SAVE_KEY); // Smažeme postup
    loadGame(); // Znovu načteme (začne se od levelu 1)
    resetGame();
});

// První spuštění hry
loadGame();

resetGame();




