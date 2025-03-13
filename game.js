// board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
  x : shipX,
  y : shipY,
  width : shipWidth,
  height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize;

let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;

let bulletArray = [];
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;

let paused = false;
let selectedOption = 0; 

let timeLeft = 60; 
let elapsedTime = 0; 
let timerInterval;

window.onload = function() {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  shipImg = new Image();
  shipImg.src = "./ship.png";
  shipImg.onload = function() {
      context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  }

  alienImg = new Image();
  alienImg.src = "./alien-magenta.png";
  createAliens();

  requestAnimationFrame(update);
  timerInterval = setInterval(updateTimer, 1000);

  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shoot);
}

function updateTimer() {
  if (!paused && !gameOver) {
    timeLeft--; 
    elapsedTime++; 

    if (timeLeft <= 0 && !gameOver) {

      gameOver = true;
      context.clearRect(0, 0, board.width, board.height); 
      context.fillStyle = "yellow";
      context.font = "48px courier";
      context.textAlign = "center";
      context.fillText("You Win!", board.width / 2, board.height / 2);
      clearInterval(timerInterval); 
    }
  }
}

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    context.fillStyle = "red";
    context.font = "48px courier";
    context.textAlign = "center";
    
    if (timeLeft > 0) {
      
      context.fillText("GameOver! You lost!", board.width / 2, board.height / 2);
    }

    return; 
  }

  if (paused) {
    displayPauseMenu();
    return;
  }

  context.clearRect(0, 0, board.width, board.height);
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienVelocityX;

      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;

        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }

  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 1;
      }
    }
  }

  while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
    bulletArray.shift();
  }

  if (alienCount === 0 && timeLeft > 0) {
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
    alienRows = Math.min(alienRows + 1, rows - 4);
    alienVelocityX += 0.2;
    alienArray = [];
    bulletArray = [];
    createAliens();
  }

  context.fillStyle = "white";
  context.font = "16px courier";
  context.textAlign = "left"; 
  context.textBaseline = "top";
  context.fillText(`Score: ${score}`, 5, 20);
  context.fillText(`Time: ${elapsedTime} sec`, 5, 40);
}



function displayPauseMenu() {
  context.fillStyle = "rgba(0, 0, 0, 0.8)";
  context.fillRect(0, 0, board.width, board.height);

  context.fillStyle = "white";
  context.font = "32px courier";
  context.textAlign = "center"; 

  context.fillText("Pause Menu", board.width / 2, board.height / 2 - 40);
  
  const options = ["Continue"];
  options.forEach((option, index) => {
    if (index === selectedOption) {
      context.fillStyle = "yellow"; 
    } else {
      context.fillStyle = "white";
    }
    context.fillText(option, board.width / 2, board.height / 2 + index * 40);
  });
}

document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.code === "KeyP") {
    paused = !paused; 
  }

  if (paused) {
    if (e.code === "ArrowUp" || e.code === "KeyW") {
      selectedOption = (selectedOption - 1 + 1) % 1; 
    }
    if (e.code === "ArrowDown" || e.code === "KeyS") {
      selectedOption = (selectedOption + 1) % 1; 
    }
    if (e.code === "Enter") {
      if (selectedOption === 0) {
        paused = false; 
      }
    }
  }
});

function moveShip(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX;
  }
  else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
    ship.x += shipVelocityX;
  }
}

function createAliens() {
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++){
      let alien = {
        img : alienImg,
        x : alienX + c * alienWidth,
        y : alienY + r * alienHeight,
        width : alienWidth,
        height : alienHeight,
        alive : true
      }
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

function shoot(e) {
  if (gameOver) {
    return;
  }

  if (e.code == "Space") {
    let bullet = {
      x : ship.x + shipWidth * 15/32,
      y : ship.y,
      width : tileSize / 8,
      height : tileSize / 2,
      used : false
    }
    bulletArray.push(bullet);
  }
}

function detectCollision(a, b) {
  return a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y;
}

function startGame() {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  shipImg = new Image();
  shipImg.src = "./ship.png";
  shipImg.onload = function() {
      context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  }

  alienImg = new Image();
  alienImg.src = "./alien-magenta.png";
  createAliens();

  requestAnimationFrame(update);
  timerInterval = setInterval(updateTimer, 1000);

  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shoot);
}
