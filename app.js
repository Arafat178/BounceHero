let gameCanvas = document.getElementById("gameBoard");
let pen = gameCanvas.getContext("2d");

let startScreen = document.getElementById("startScreen");
let gameDisplay = document.getElementById("gameDisplay");

let playerNameInput = document.getElementById("playerNameInput");
let playerImageInput = document.getElementById("playerImageInput");
let startBtn = document.getElementById("startBtn");

let leftButton =document.getElementById("leftbtn");
let rightButton = document.getElementById("rightbtn");
let gameOverScreen = document.getElementById("gameOverScreen");
let restartBtn = document.getElementById("restartBtn");
let bounceMusic = new Audio("football_kick.wav");
let gameOverMusic = new Audio("gameWinner.ogg");

// Player details
let playerName = "";
let playerImage = null;

function playBounceMusic(){
    bounceMusic.currentTime = 0;
    bounceMusic.play();
}

// play game over sound
function playGameOver(){
    gameOverMusic.play();
}

// state for button hold
let movingLeft = false;
let movingRight = false;
let gameOver = false;
let score = 0;

// ball object
let ball = {x:200, y:50, vx:3, vy:2.5,radius:30};

// Draw ball (with player image inside)
function ballXY(x, y) {
    pen.save();
    pen.beginPath();
    pen.arc(x, y, ball.radius, 0, Math.PI * 2);
    pen.closePath();
    pen.clip();

    if (playerImage) {
        pen.drawImage(playerImage, x - ball.radius, y - ball.radius, ball.radius * 2, ball.radius * 2);
    } else {
        pen.fillStyle = "green";
        pen.fill();
    }
    pen.restore();

    pen.beginPath();
    pen.arc(x, y, ball.radius, 0, Math.PI * 2);
    pen.strokeStyle = "lightblue";
    pen.stroke();
}

// bar object
let bar = {x: 30,y:450,width:60,height:10,speed:4};

// draw bar
function barXY(x, y, w, h){
    // Gradient for neon look
    let gradient = pen.createLinearGradient(x, y, x + w, y);
    gradient.addColorStop(0, "#ffcc00"); // bright yellow
    gradient.addColorStop(1, "#ff6600"); // orange

    pen.beginPath();
    pen.rect(x, y, w, h);
    pen.fillStyle = gradient;
    pen.fill();

    // Darker border for depth
    pen.lineWidth = 2;
    pen.strokeStyle = "#aa5500";
    pen.stroke();

    // Glow effect to make it pop on dark background
    pen.shadowColor = "#ffcc00";
    pen.shadowBlur = 15;
    pen.shadowOffsetX = 0;
    pen.shadowOffsetY = 0;

    pen.closePath();

    // Reset shadow for other drawings
    pen.shadowBlur = 0;
}
//add bar style and bar draw

// update bar position based on state
function updateBar(){
    if(movingLeft && bar.x > 0){
        bar.x -= bar.speed;
    }
    if(movingRight && bar.x + bar.width < gameCanvas.width){
        bar.x += bar.speed;
    }
}

//coments acording to hit the ball
const comments = [
  "Awesome!", "Fantastic!", "Superb!", "Amazing shot!", "Incredible!",
  "Nice bounce!", "Perfect timing!", "Good one!", "Epic move!",
  "What a hit!", "Clean contact!", "You’re on fire!", "Beautiful strike!",
  "Smash that ball!", "Sweet touch!", "Bounce master!", "Unstoppable!",
  "Killer reflex!", "Flawless!", "Insane shot!", "Bang on!", "Pure skill!",
  "That’s style!", "Solid hit!", "Unbelievable!", "Bravo!", "Legendary move!",
  "Precision bounce!", "Power play!", "Champion move!", "Slick rebound!",
  "Unreal!", "Electric shot!", "Pro-level bounce!", "Monster hit!",
  "Reflex king!", "Lightning hands!", "That was wild!", "Perfect bounce!",
  "Clutch save!", "Pure talent!", "You nailed it!", "Momentum rising!",
  "No mercy!", "High voltage!", "Bounce hero!", "Supreme timing!",
  "Perfect reflex!", "You’re glowing!", "Neo-speed!", "Robot reflex!"
];

function showComment() {
    const commentDiv = document.getElementById("gameComment");
    const randomComment = comments[Math.floor(Math.random() * comments.length)];
    commentDiv.textContent = randomComment;
    commentDiv.style.opacity = 1;

    // ১ সেকেন্ড পরে comment fade হয়ে যাবে
    setTimeout(() => {
        commentDiv.style.opacity = 0;
    }, 1000);
}


// button press events
leftButton.addEventListener("mousedown", () => movingLeft = true);
leftButton.addEventListener("mouseup", () => movingLeft = false);
leftButton.addEventListener("mouseleave", () => movingLeft = false); 

// Mobile
leftButton.addEventListener("touchstart", (e) => { e.preventDefault(); movingLeft = true; });
leftButton.addEventListener("touchend", () => movingLeft = false);

rightButton.addEventListener("mousedown", () => movingRight = true);
rightButton.addEventListener("mouseup", () => movingRight = false);
rightButton.addEventListener("mouseleave", () => movingRight = false);

rightButton.addEventListener("touchstart", (e) => { e.preventDefault(); movingRight = true; });
rightButton.addEventListener("touchend", () => movingRight = false);

// global mouse/touch release (safety)
document.addEventListener("mouseup", () => { movingLeft = false; movingRight = false; });
document.addEventListener("touchend", () => { movingLeft = false; movingRight = false; });

restartBtn.addEventListener("click", restartGame); // restart game


//saving score in database and leaderboard
// Save player score after game over
function submitScore(playerName, score) {
    const playerId = Date.now(); // unique id, timestamp based

    fetch('https://bouncehero-1d7ee-default-rtdb.asia-southeast1.firebasedatabase.app/players/' + playerId + '.json', {
        method: 'PUT',
        body: JSON.stringify({
            name: playerName,
            score: score
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Score submitted:', data);
        showLeaderboard();
    })
    .catch(err => console.error('Error saving score:', err));
}

function showLeaderboard() {
    fetch('https://bouncehero-1d7ee-default-rtdb.asia-southeast1.firebasedatabase.app/players.json')
        .then(res => res.json())
        .then(data => {
            if (!data) return;

            let players = Object.values(data);
            players.sort((a,b) => b.score - a.score);
            players = players.slice(0, 20); // Top 20

            const leaderboardDiv = document.getElementById('leaderboard');
            leaderboardDiv.innerHTML = `<div class="leaderboard-header">
                                            <span class="rank">Rank</span>
                                            <span class="name">Player</span>
                                            <span class="score">Score</span>
                                        </div>`;

            players.forEach((p,index) => {
                leaderboardDiv.innerHTML += `
                    <div class="leaderboard-row">
                        <span class="rank">${index+1}</span>
                        <span class="name">${p.name}</span>
                        <span class="score">${p.score}</span>
                    </div>
                `;
            });
        })
        .catch(err => console.error(err));
}




// update ball position and bounce and collision
function updateVariable() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // bounce from walls
    if (ball.x >= gameCanvas.width-ball.radius || ball.x <= ball.radius) {
        ball.vx = -ball.vx;
    }
    if (ball.y <= ball.radius) {
        ball.vy = -ball.vy;
    }

    if (ball.x + ball.radius >= bar.x &&
    ball.x - ball.radius <= bar.x + bar.width &&
    ball.y + ball.radius >= bar.y &&
    ball.y + ball.radius <= bar.y + bar.height) {
    ball.vy = -ball.vy;
    score++;
    playBounceMusic();
    showComment();

    // প্রতি score এ speed 0.1 করে বাড়বে
    if (ball.vx > 0) {
        ball.vx += 0.3;
    } else {
        ball.vx -= 0.3;
    }

    if (ball.vy > 0) {
        ball.vy += 0.2;
    } else {
        ball.vy -= 0.2;
    }
    } //ball and bar collision check


    // Ball dropped → Game Over
    if(ball.y -ball.radius > gameCanvas.height){
        gameOver = true;
        gameOverScreen.style.display = "block";
        playGameOver();
        submitScore(playerName, score);
    }
} //ball bar update

//score display
function drawScore(){
    pen.font = "30px Arial";
    pen.fillStyle = "lightblue";
    pen.fillText("Player: "+playerName + " | Score: " + score, 20, 30);
}


function gameLoop(){
    if (gameOver) return;
    // clear canvas
    pen.clearRect(0,0,gameCanvas.width,gameCanvas.height);
    //score box
    drawScore();
    // draw ball
    ballXY(ball.x, ball.y);
    barXY(bar.x,bar.y,bar.width,bar.height);

    // update position
    updateVariable();
    updateBar();

    // repeat
    requestAnimationFrame(gameLoop);
}

// Restart game
function restartGame(){
    gameOver = false;
    gameOverScreen.style.display = "none";

    // reset positions
    score = 0;
    ball.x = 200;
    ball.y = 50;
    ball.vx = 3;
    ball.vy = 2.5;

    bar.x = 100;
    bar.y = 450;

    gameLoop();
}

// Start button → load player details & start game
startBtn.addEventListener("click", () => {
    playerName = playerNameInput.value || "Player";

    let file = playerImageInput.files[0];
    if (file) {
        let img = new Image();
        img.onload = function () {
            playerImage = img;
            startScreen.style.display = "none";
            gameDisplay.style.display = "block";
            gameLoop();
        };
        img.src = URL.createObjectURL(file);
    } else {
        startScreen.style.display = "none";
        gameDisplay.style.display = "block";
        gameLoop();
    }
});


