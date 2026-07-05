// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 4;
const MAX_BALL_SPEED = 8;
const WIN_SCORE = 5;

// Game Objects
const gameBoard = document.getElementById('gameBoard');
const playerPaddle = document.getElementById('playerPaddle');
const computerPaddle = document.getElementById('computerPaddle');
const ball = document.getElementById('ball');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');

// Game State
let gameState = {
    playerScore: 0,
    computerScore: 0,
    gameRunning: true,
    playerWon: false,
    computerWon: false
};

let playerPos = {
    y: (GAME_HEIGHT - PADDLE_HEIGHT) / 2
};

let computerPos = {
    y: (GAME_HEIGHT - PADDLE_HEIGHT) / 2
};

let ballPos = {
    x: GAME_WIDTH / 2 - BALL_SIZE / 2,
    y: GAME_HEIGHT / 2 - BALL_SIZE / 2
};

let ballVelocity = {
    x: INITIAL_BALL_SPEED,
    y: INITIAL_BALL_SPEED
};

// Input Handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

let mouseY = GAME_HEIGHT / 2;

document.addEventListener('mousemove', (e) => {
    const rect = gameBoard.getBoundingClientRect();
    mouseY = e.clientY - rect.top - PADDLE_HEIGHT / 2;
});

// Update Functions
function updatePlayerPaddle() {
    // Arrow keys or mouse control
    if (keys['ArrowUp']) {
        playerPos.y -= PADDLE_SPEED;
    }
    if (keys['ArrowDown']) {
        playerPos.y += PADDLE_SPEED;
    }
    
    // Mouse control (smooth following)
    const mouseTarget = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, mouseY));
    const distance = mouseTarget - playerPos.y;
    if (Math.abs(distance) > 2) {
        playerPos.y += distance * 0.1;
    } else {
        playerPos.y = mouseTarget;
    }
    
    // Constrain paddle to game board
    playerPos.y = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, playerPos.y));
    
    playerPaddle.style.top = playerPos.y + 'px';
}

function updateComputerPaddle() {
    const computerCenter = computerPos.y + PADDLE_HEIGHT / 2;
    const ballCenter = ballPos.y + BALL_SIZE / 2;
    const difficulty = 0.15; // Computer AI difficulty (0-1, higher = smarter)
    
    // Simple AI that tracks the ball
    if (computerCenter < ballCenter - 35) {
        computerPos.y += PADDLE_SPEED * difficulty;
    } else if (computerCenter > ballCenter + 35) {
        computerPos.y -= PADDLE_SPEED * difficulty;
    }
    
    // Add some randomness to make it beatable
    const randomness = (Math.random() - 0.5) * 2;
    if (ballPos.x > GAME_WIDTH / 2) {
        computerPos.y += randomness;
    }
    
    // Constrain paddle to game board
    computerPos.y = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, computerPos.y));
    
    computerPaddle.style.top = computerPos.y + 'px';
}

function updateBall() {
    ballPos.x += ballVelocity.x;
    ballPos.y += ballVelocity.y;
    
    // Top and bottom wall collision
    if (ballPos.y <= 0) {
        ballPos.y = 0;
        ballVelocity.y = -ballVelocity.y;
    }
    if (ballPos.y >= GAME_HEIGHT - BALL_SIZE) {
        ballPos.y = GAME_HEIGHT - BALL_SIZE;
        ballVelocity.y = -ballVelocity.y;
    }
    
    // Player paddle collision
    if (
        ballPos.x <= PADDLE_WIDTH + 10 &&
        ballPos.y + BALL_SIZE >= playerPos.y &&
        ballPos.y <= playerPos.y + PADDLE_HEIGHT &&
        ballVelocity.x < 0
    ) {
        ballPos.x = PADDLE_WIDTH + 10;
        ballVelocity.x = -ballVelocity.x;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ballPos.y + BALL_SIZE / 2 - playerPos.y) / PADDLE_HEIGHT;
        ballVelocity.y += (hitPos - 0.5) * 4;
        
        // Increase speed slightly
        const speed = Math.sqrt(ballVelocity.x ** 2 + ballVelocity.y ** 2);
        if (speed < MAX_BALL_SPEED) {
            ballVelocity.x *= 1.05;
            ballVelocity.y *= 1.05;
        }
    }
    
    // Computer paddle collision
    if (
        ballPos.x >= GAME_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE &&
        ballPos.y + BALL_SIZE >= computerPos.y &&
        ballPos.y <= computerPos.y + PADDLE_HEIGHT &&
        ballVelocity.x > 0
    ) {
        ballPos.x = GAME_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE;
        ballVelocity.x = -ballVelocity.x;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ballPos.y + BALL_SIZE / 2 - computerPos.y) / PADDLE_HEIGHT;
        ballVelocity.y += (hitPos - 0.5) * 4;
        
        // Increase speed slightly
        const speed = Math.sqrt(ballVelocity.x ** 2 + ballVelocity.y ** 2);
        if (speed < MAX_BALL_SPEED) {
            ballVelocity.x *= 1.05;
            ballVelocity.y *= 1.05;
        }
    }
    
    // Scoring
    if (ballPos.x < 0) {
        gameState.computerScore++;
        computerScoreDisplay.textContent = gameState.computerScore;
        resetBall();
    }
    if (ballPos.x > GAME_WIDTH) {
        gameState.playerScore++;
        playerScoreDisplay.textContent = gameState.playerScore;
        resetBall();
    }
    
    // Check for game over
    if (gameState.playerScore >= WIN_SCORE) {
        gameState.gameRunning = false;
        gameState.playerWon = true;
        alert(`You win! Final Score: ${gameState.playerScore} - ${gameState.computerScore}`);
        resetGame();
    }
    if (gameState.computerScore >= WIN_SCORE) {
        gameState.gameRunning = false;
        gameState.computerWon = true;
        alert(`Game Over! Computer wins. Final Score: ${gameState.playerScore} - ${gameState.computerScore}`);
        resetGame();
    }
    
    ball.style.left = ballPos.x + 'px';
    ball.style.top = ballPos.y + 'px';
}

function resetBall() {
    ballPos.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
    ballPos.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
    
    // Random direction
    const angle = (Math.random() * 60 - 30) * Math.PI / 180;
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    ballVelocity.x = Math.cos(angle) * INITIAL_BALL_SPEED * direction;
    ballVelocity.y = Math.sin(angle) * INITIAL_BALL_SPEED;
}

function resetGame() {
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    playerScoreDisplay.textContent = '0';
    computerScoreDisplay.textContent = '0';
    gameState.gameRunning = true;
    
    playerPos.y = (GAME_HEIGHT - PADDLE_HEIGHT) / 2;
    computerPos.y = (GAME_HEIGHT - PADDLE_HEIGHT) / 2;
    resetBall();
}

// Main Game Loop
function gameLoop() {
    if (gameState.gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
    requestAnimationFrame(gameLoop);
}

// Initialize game
playerPaddle.style.top = playerPos.y + 'px';
computerPaddle.style.top = computerPos.y + 'px';
ball.style.left = ballPos.x + 'px';
ball.style.top = ballPos.y + 'px';

gameLoop();
