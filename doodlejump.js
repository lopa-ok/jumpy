const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.8;
const JUMP_STRENGTH = -12;
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 30;
const PLAYER_COLOR = 'red';
const PLATFORM_COLOR = 'green';

const BIG_PLATFORM_WIDTH = canvas.width;
const BIG_PLATFORM_HEIGHT = 50;
const PLATFORM_SPACING_Y = 100; // Vertical spacing between platforms
const PLATFORM_SPACING_X = 150; // Horizontal spacing between platforms

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0,
    dy: 0,
};

let platforms = [];
const platformCount = 10;
const platformGenerationThreshold = canvas.height; // When to generate new platforms

// Initialize the camera offset
let cameraOffset = {
    x: canvas.width / 2 - player.x,
    y: canvas.height / 2 - player.y
};

function createInitialPlatforms() {
    platforms = [];
    // Add the big starting platform in the middle
    platforms.push({
        x: (canvas.width - BIG_PLATFORM_WIDTH) / 2,
        y: canvas.height - BIG_PLATFORM_HEIGHT,
        width: BIG_PLATFORM_WIDTH,
        height: BIG_PLATFORM_HEIGHT,
    });

    // Add other platforms at decreasing heights
    let lastX = (canvas.width - PLATFORM_WIDTH) / 2; // Start with the middle of the canvas
    for (let i = 0; i < platformCount; i++) {
        platforms.push({
            x: lastX,
            y: canvas.height - BIG_PLATFORM_HEIGHT - (i + 1) * PLATFORM_SPACING_Y,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT,
        });

        // Update lastX to be closer to the current platform
        lastX += PLATFORM_SPACING_X * (Math.random() > 0.5 ? 1 : -1); // Randomly move left or right
        lastX = Math.max(0, Math.min(canvas.width - PLATFORM_WIDTH, lastX)); // Ensure it stays within bounds
    }
}

function drawPlayer() {
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(player.x - cameraOffset.x, player.y - cameraOffset.y, player.width, player.height);
}

function drawPlatforms() {
    ctx.fillStyle = PLATFORM_COLOR;
    platforms.forEach(platform => {
        ctx.fillRect(platform.x - cameraOffset.x, platform.y - cameraOffset.y, platform.width, platform.height);
    });
}

function updatePlayer() {
    player.dy += GRAVITY;
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    if (player.y > canvas.height) {
        player.y = canvas.height;
        player.dy = 0;
    }

    platforms.forEach(platform => {
        if (
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.dy > 0
        ) {
            player.y = platform.y - player.height;
            player.dy = JUMP_STRENGTH;
        }
    });

    // Update camera offset based on player's position
    cameraOffset.x = player.x - canvas.width / 2 + player.width / 2;
    cameraOffset.y = player.y - canvas.height / 2 + player.height / 2;

    // Recycle platforms if they go out of view
    platforms.forEach((platform, index) => {
        if (platform.y > player.y + canvas.height) {
            platforms.splice(index, 1); // Remove platform
            addPlatformAbove();
        }
    });
}

function addPlatformAbove() {
    const lastPlatform = platforms[platforms.length - 1];
    const newPlatformX = lastPlatform.x + PLATFORM_SPACING_X * (Math.random() > 0.5 ? 1 : -1);
    const newPlatformY = lastPlatform.y - PLATFORM_SPACING_Y;

    platforms.push({
        x: Math.max(0, Math.min(canvas.width - PLATFORM_WIDTH, newPlatformX)), // Ensure it stays within bounds
        y: newPlatformY,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawPlayer();
    updatePlayer();
    requestAnimationFrame(draw);
}

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') player.dx = -5;
    if (e.key === 'ArrowRight') player.dx = 5;
    if (e.key === ' ') player.dy = JUMP_STRENGTH;
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

createInitialPlatforms();
draw();
