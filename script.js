const bgMusic = new Audio("./sound/bg.mp3");
const eatSound = new Audio('./sound/yea.mp3');
const crashSound = new Audio('./sound/go.mp3');
bgMusic.loop = true; 
let dom_replay = document.querySelector("#replay");
let dom_score = document.querySelector("#score");
let dom_canvas = document.createElement("canvas");
document.querySelector("#canvas").appendChild(dom_canvas);
let CTX = dom_canvas.getContext("2d");
let backgroundImage = new Image();
backgroundImage.src = 'wp.jpg'; 
const W = (dom_canvas.width = 1200);
const H = (dom_canvas.height = 1200);
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
let touchStartX = 0;
let touchStartY = 0;


function playbg(){  bgMusic.play()}

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  event.preventDefault();
  let touchEndX = event.touches[0].clientX;
  let touchEndY = event.touches[0].clientY;

  let deltaX = touchEndX - touchStartX;
  let deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      snake.dir = new helpers.Vec(cellSize, 0);
    } else {
      snake.dir = new helpers.Vec(-cellSize, 0);
    }
  } else {
    if (deltaY > 0) {
      snake.dir = new helpers.Vec(0, cellSize);
    } else {
      snake.dir = new helpers.Vec(0, -cellSize);
    }
  }
}

document.addEventListener('mousemove', handleMouseMove);

function handleMouseMove(event) {
  let mouseX = event.clientX;
  let mouseY = event.clientY;

  let snakeHeadX = snake.pos.x + snake.size / 2;
  let snakeHeadY = snake.pos.y + snake.size / 2;

  let deltaX = mouseX - snakeHeadX;
  let deltaY = mouseY - snakeHeadY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      snake.dir = new helpers.Vec(cellSize, 0);
    } else {
      snake.dir = new helpers.Vec(-cellSize, 0);
    }
  } else {
    if (deltaY > 0) {
      snake.dir = new helpers.Vec(0, cellSize);
    } else {
      snake.dir = new helpers.Vec(0, -cellSize);
    }
  }
}

let snake,
  foods = [],
  currentHue,
  cells = 50,
  cellSize= W /cells,
  isGameOver = false,
  tails = [],
  score = 0,
  maxScore = window.localStorage.getItem("maxScore") || 0,
  particles = [],
  splashingParticleCount = 20,
  cellsCount,
  requestID,
  targetWord = '',
  words = ['belt', 'shirt', 'boot', 'glasses'];

  let foodImages = {
    belt: new Image(),
    shirt: new Image(),
    boot: new Image(),
    glasses: new Image()
  };

foodImages.belt.src = 'belt.png';
foodImages.shirt.src = 'shirt.png';
foodImages.boot.src = 'boot.png';
foodImages.glasses.src = 'glasses.png';

let helpers = {
  Vec: class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    mult(v) {
      if (v instanceof helpers.Vec) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
      } else {
        this.x *= v;
        this.y *= v;
        return this;
      }
    }
  },
  isCollision(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y;
  },
  garbageCollector() {
    for (let i = 0; i < particles.length; i++) {
      if (particles[i].size <= 0) {
        particles.splice(i, 1);
      }
    }
  },
  drawGrid() {
    const gradient = CTX.createConicGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
    gradient.addColorStop(0, "#15232E");
    gradient.addColorStop(1, "#2D546E");
  
    CTX.fillStyle = gradient;
    CTX.fillRect(0, 0, W, H);
  
    const circleRadius = 10;
    const circleGap = W / cells;
  
    for (let x = circleGap / 2; x < W; x += circleGap) {
      for (let y = circleGap / 2; y < H; y += circleGap) {
        CTX.beginPath();
        CTX.arc(x, y, circleRadius, 0, Math.PI * 2);
        CTX.fillStyle = "#232332"; 
        CTX.fill();
        CTX.closePath();
      }
    }
  },
  drawBackground() {
    let gradient = CTX.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#000000");
  
    CTX.fillStyle = gradient;
    CTX.fillRect(0, 0, W, H);
  
    let circleRadius = 150;
    let circleSpacing = 200;
  
    CTX.fillStyle = "#0d0d1a";
  
    for (let x = circleSpacing / 2; x < W; x += circleSpacing) {
      for (let y = circleSpacing / 2; y < H; y += circleSpacing) {
        let circleGradient = CTX.createRadialGradient(x, y, 0, x, y, circleRadius);
        circleGradient.addColorStop(0, "rgba(0, 0, 50, 0.8)");
        circleGradient.addColorStop(1, "rgba(0, 0, 200, 0.1)");
  
        CTX.beginPath();
        CTX.arc(x, y, circleRadius, 0, Math.PI * 2);
        CTX.fillStyle = circleGradient;
        CTX.fill();
        CTX.closePath();
      }
    }
  },
  randHue() {
    return ~~(Math.random() * 360);
  },
  hsl2rgb(hue, saturation, lightness) {
    if (hue == undefined) {
      return [0, 0, 0];
    }
    var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    var huePrime = hue / 60;
    var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = ~~huePrime;
    var red;
    var green;
    var blue;

    if (huePrime === 0) {
      red = chroma;
      green = secondComponent;
      blue = 0;
    } else if (huePrime === 1) {
      red = secondComponent;
      green = chroma;
      blue = 0;
    } else if (huePrime === 2) {
      red = 0;
      green = chroma;
      blue = secondComponent;
    } else if (huePrime === 3) {
      red = 0;
      green = secondComponent;
      blue = chroma;
    } else if (huePrime === 4) {
      red = secondComponent;
      green = 0;
      blue = chroma;
    } else if (huePrime === 5) {
      red = chroma;
      green = 0;
      blue = secondComponent;
    }

    var lightnessAdjustment = lightness - chroma / 2;
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    return [
      Math.round(red * 255),
      Math.round(green * 255),
      Math.round(blue * 255)
    ];
  },
  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
};



class Food {
  constructor(type, image) {
    this.type = type;
    this.image = image;
    this.pos = new helpers.Vec(
      ~~(Math.random() * cells) * cellSize,
      ~~(Math.random() * cells) * cellSize
    );
    this.size = cellSize;
    // this.instances = [];
    // this.spawnInitial();

  }
  draw() {
    let { x, y } = this.pos;
    CTX.drawImage(this.image, x, y, this.size, this.size);
  }
  
  // spawnInitial() {
  //   for (let i = 0; i < this.maxInstances; i++) {
  //     this.spawn();
  //   }
  // }
  // spawn() {
  //   let randX = ~~(Math.random() * cells) * this.size;
  //   let randY = ~~(Math.random() * cells) * this.size;
  //   for (let path of snake.history) {
  //     if (helpers.isCollision(new helpers.Vec(randX, randY), path)) {
  //       return this.spawn();
  //     }
  //   }
  //   this.pos = new helpers.Vec(randX, randY);
  // }
  drawGlow() {
    let { x, y } = this.pos;
    let glowRadius = 10 + Math.sin(Date.now() * 0.005) * 5; 

    CTX.save();
    CTX.beginPath();
    CTX.arc(x + this.size / 2, y + this.size / 2, glowRadius, 0, Math.PI * 2);
    CTX.globalAlpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.5; 
    CTX.fillStyle = 'rgba(255,255,255,0.2)';
    CTX.shadowColor = 'white';
    CTX.shadowBlur = 20;
    CTX.fill();
    CTX.closePath();
    CTX.restore();
  }
}

function spawnFoodItems() {
  foods = [];
  for (let i = 0; i < 10; i++) {  
    words.forEach(word => {
      foods.push(new Food(word, foodImages[word]));
    });
  }
}
function displayRandomWord() {
  let randIndex = Math.floor(Math.random() * words.length);
  targetWord = words[randIndex];
  document.querySelector("#targetWord").innerText = targetWord.toUpperCase();
}

class Snake {
  constructor() {
    this.pos = new helpers.Vec(W / 2, H / 2);
    this.dir = new helpers.Vec(0, 0);
    this.size = cellSize;
    this.color = "white";
    this.history = [];
    this.total = 5;
    this.glowCycle = 0; 

    this.delay = 5;
       this.eyeOffset = {
        left: new helpers.Vec(-this.size / 6, -this.size / 6),
        right: new helpers.Vec(this.size / 6, -this.size / 6)
      };
      for (let i = 0; i < this.total; i++) {
        this.history.push(new helpers.Vec(this.pos.x - i * this.size, this.pos.y));
      }
      console.log("Initial Position:", this.pos);
      console.log("Initial History:", this.history);

  }
  
  draw() {
    let { size, history, pos } = this;
    let { x, y } = pos;

    CTX.fillStyle = this.color;
    CTX.shadowBlur = 20;
    CTX.shadowColor = "rgba(0, 0, 0, 0.5)";
    CTX.shadowOffsetX = 5;
    CTX.shadowOffsetY = 5;
    CTX.beginPath();
    CTX.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    CTX.fill();
    CTX.shadowBlur = 0;
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;

    let eyeSize = this.size / 6;
    CTX.fillStyle = "black";
    CTX.beginPath();
    CTX.arc(x + size / 2 + this.eyeOffset.left.x, y + size / 2 + this.eyeOffset.left.y, eyeSize, 0, Math.PI * 2);
    CTX.fill();
    CTX.beginPath();
    CTX.arc(x + size / 2 + this.eyeOffset.right.x, y + size / 2 + this.eyeOffset.right.y, eyeSize, 0, Math.PI * 2);
    CTX.fill();

    for (let i = 1; i < this.history.length; i++) {
      let { x, y } = history[i];
      let radius = size / 2;
      let gradient = CTX.createRadialGradient(x + radius, y + radius, radius / 2, x + radius, y + radius, radius);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#a0a0a0");

      CTX.fillStyle = gradient;
      CTX.beginPath();
      CTX.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      CTX.fill();
    }

    CTX.fillStyle = "#FFFF00"; 
    if (targetWord === "belt") {
      CTX.fillStyle = "#0000FF";
    } else if (targetWord === "shirt") {
      CTX.fillStyle = "#00FFFF"; 
    } else if (targetWord === "boot") {
      CTX.fillStyle = "#A52A2A"; 
    } else if (targetWord === "glasses") {
      CTX.fillStyle = "#00FF00"; 
    }

    CTX.font = "bold 20px Poppins, sans-serif";
    CTX.textAlign = "left";
    CTX.fillText(targetWord.toUpperCase(), x + size + 10, y + size / 2 + 5);
  }


  walls() {
    let { x, y } = this.pos;
    if (x + this.size > W || x < 0 || y + this.size > H || y < 0) {
      isGameOver = true;

      crashSound.play(); 

    }
  }
  controlls() {
    let dir = this.size;
    if (KEY.ArrowUp) this.dir = new helpers.Vec(0, -dir);
    if (KEY.ArrowDown) this.dir = new helpers.Vec(0, dir);
    if (KEY.ArrowLeft) this.dir = new helpers.Vec(-dir, 0);
    if (KEY.ArrowRight) this.dir = new helpers.Vec(dir, 0);
  }
  selfCollision() {
    for (let i = 0; i < this.history.length; i++) {
      let p = this.history[i];
      if (helpers.isCollision(this.pos, p)) {
        isGameOver = false;
      }
    }
  }


  update() {
    this.walls();
    this.draw();
    this.controlls();

    
    if (!this.delay--) {
      foods.forEach((food) => {
        if (helpers.isCollision(this.pos, food.pos)) {
          if (food.type !== targetWord) {
            isGameOver = true;

            crashSound.play();

          } else {
            incrementScore();
            eatSound.play(); 
            food.pos = new helpers.Vec(
              ~~(Math.random() * cells) * cellSize,
              ~~(Math.random() * cells) * cellSize
            );
            this.total++;
          }
        }
      });

   
      this.history[this.total - 1] = new helpers.Vec(this.pos.x, this.pos.y);
      for (let i = 0; i < this.total - 1; i++) {
        this.history[i] = this.history[i + 1];
      }
      this.pos.add(this.dir);
      this.delay = 5;
      if (this.total > 3) this.selfCollision();
    }
  }

  shouldOpenMouth() {
    for (let food of foods) {
      if (helpers.isCollision(this.pos, food.pos) && food.type !== targetWord) {
        return true;
      }
    }
    return false;
  }
}

function incrementScore() {
  score++;
  dom_score.innerText = score < 10 ? "0" + score : score;
}

function particleSplash(food) {
  for (let i = 0; i < splashingParticleCount; i++) {
    let vel = new helpers.Vec(Math.random() * 6 - 3, Math.random() * 6 - 3);
    let position = new helpers.Vec(food.pos.x, food.pos.y);
    particles.push(new Particle(position, food.color, food.size, vel));
  }
}

function clear() {
  CTX.clearRect(0, 0, W, H);
  CTX.drawImage(backgroundImage, 0, 0, W, H);

}

function gameOver() {
  bgMusic.pause()

  isGameOver = true;
  CTX.fillStyle = "rgba(0,0,0,.9)";
  CTX.fillRect(0, 0, W, H);
  CTX.fillStyle = "#FFF";
  CTX.textAlign = "center";
  CTX.font = "bold 20px Poppins, sans-serif";
  CTX.fillText("GAME OVER", W / 2, H / 2);
  CTX.font = "10px Poppins, sans-serif";
  CTX.fillText(
    "SCORE: " + score + " / MAX: " + maxScore,
    W / 2,
    H / 2 + 30
  );
  dom_replay.style.display = "block";
}

let KEY = {
  ArrowUp: 0,
  ArrowDown: 0,
  ArrowLeft: 0,
  ArrowRight: 0,
  listen() {
    addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") KEY.ArrowUp = 1;
      if (e.key === "ArrowDown") KEY.ArrowDown = 1;
      if (e.key === "ArrowLeft") KEY.ArrowLeft = 1;
      if (e.key === "ArrowRight") KEY.ArrowRight = 1;
    });
    addEventListener("keyup", (e) => {
      if (e.key === "ArrowUp") KEY.ArrowUp = 0;
      if (e.key === "ArrowDown") KEY.ArrowDown = 0;
      if (e.key === "ArrowLeft") KEY.ArrowLeft = 0;
      if (e.key === "ArrowRight") KEY.ArrowRight = 0;
    });
  }
};

function reset() {
  clearTimeout(requestID);
  dom_replay.style.display = "none";
  isGameOver = false;
  snake = new Snake();
  score = 0;
  foods = [];
  spawnFoodItems();
  displayRandomWord();
  loop();
}
function adjustCamera() {
  const cameraX = snake.pos.x - W / 2;
  const cameraY = snake.pos.y - H / 2;

  CTX.translate(-cameraX, -cameraY);
}

function loop() {
  clear();
  if (!isGameOver) {
    adjustCamera()
    
    requestID = setTimeout(loop, 1000 / 60);
    helpers.drawBackground()
    
    snake.update();
    foods.forEach((food) => {
      food.draw();
    });    for (let p of particles) {
      p.update();
    }
    helpers.garbageCollector();
    CTX.setTransform(1, 0, 0, 1, 0, 0); 

  } else {
    gameOver();
  }
}



function initialize() {
  CTX.imageSmoothingEnabled = false;
  KEY.listen();
  cellsCount = cells * cells;
  cellSize = W / cells;
playbg()

  snake = new Snake();
  snake.draw()
  spawnFoodItems();
  displayRandomWord();
  setInterval(displayRandomWord, 10000);
  dom_replay.addEventListener("click", reset, false);
  
  loop();
}


initialize();
