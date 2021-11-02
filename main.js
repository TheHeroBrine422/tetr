boardSize = [10, 20]
let visualboard = []
let permboard = []
let blockSize = 1
let speed = 300
let lastGrav = 0;
let activeKeys = {"w": false, "a": false, "s": false, "d": false}
let lastAction = [0,0,0] // [x,y,rot]
let activeTetrimino = {
  x: -1,
  y: -1,
  index: -1,
  rot: 0,
}
let score = 0
let lines = 0
let colors = ["#00ffff", "#0000ff", "#ff7f00", "#ffff00", "#00ff00", "#800080", "#ff0000"]

function resizeBoard() {
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  temp = [Math.floor(window.innerHeight/boardSize[1]), Math.floor(window.innerWidth/boardSize[0])]
  blockSize = Math.min(...temp)
  ctx.canvas.height = blockSize*boardSize[1]
  ctx.canvas.width = blockSize*boardSize[0]
  canvas.style.left = Math.floor(window.innerWidth/3)+"px";
  canvas.style.top = "0px";
  canvas.style.position = "absolute";
  drawBoard()
}

function drawBoard() {
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (var i = 0; i < visualboard.length; i++) {
    for (var j = 0; j < visualboard[i].length; j++) {
      if (!visualboard[i][j][0]) {
        ctx.fillStyle = "#000000";
      } else {
        ctx.fillStyle = visualboard[i][j][1]
      }
      ctx.fillRect(j*blockSize, i*blockSize, blockSize, blockSize)
      ctx.strokeStyle = 'grey';
      ctx.strokeRect(j*blockSize, i*blockSize, blockSize, blockSize);
    }
  }
  document.getElementById("score").innerText = "Score: "+score.toLocaleString("en-US");
  document.getElementById("lines").innerText = "Lines: "+lines
}

function gameLoop() {
  stop = false;
  visualboard = JSON.parse(JSON.stringify(permboard)) // dealing with reference copying
  if (activeTetrimino.index == -1) {
    activeTetrimino.index = Math.floor(Math.random()*tetriminos.length)
    activeTetrimino.rot = 0;
    activeTetrimino.y = 0;
    activeTetrimino.x = 4;
  }
  let s = speed
  if (activeKeys["s"]) {
    s = speed/4
    activeKeys["s"] = false
  }
  if (lastGrav+s < Date.now()) {
    lastGrav = Date.now()
    lastAction = [0,1,0]
    activeTetrimino.y++;
  }
  ["a", "w", "d"].forEach((item) => {
    if (lastAction[0] == 0 && lastAction[1] == 0 && lastAction[2] == 0) {
      if (item == "w" && activeKeys[item]) {
        lastAction = [0,0,1]
        activeTetrimino.rot++;
        activeTetrimino.rot = activeTetrimino.rot % 4;
        activeKeys[item] = false
      } else if (item == "a" && activeKeys[item]) {
        lastAction = [-1,0,0]
        activeTetrimino.x--;
        activeKeys[item] = false
      } else if (item == "d" && activeKeys[item]) {
        lastAction = [1,0,0]
        activeTetrimino.x++;
        activeKeys[item] = false
      }
    }
  });
  t = JSON.parse(JSON.stringify(tetriminos[activeTetrimino.index][activeTetrimino.rot]))
  for (var i = 0; i < t.length; i++) { // todo: collision detection
    for (var j = 0; j < t[i].length; j++) {
      if (t[i][j]) {
        if (activeTetrimino.y+i >= visualboard.length) { // hit ground
          stop = true;
          activeTetrimino.y--;
        }
        if (activeTetrimino.y+i >= boardSize[1] || activeTetrimino.y+i < 0 || activeTetrimino.x+j >= boardSize[0] || activeTetrimino.x+j < 0 || visualboard[activeTetrimino.y+i][activeTetrimino.x+j][0]) {
          if (lastAction[1] == 1) {
            stop = true;
            activeTetrimino.y--;
          } else if (lastAction[0] == 1) {
            activeTetrimino.x--;
          } else if (lastAction[0] == -1) {
            activeTetrimino.x++;
          } else if (lastAction[2] == 1) {
            activeTetrimino.rot--;
            if (activeTetrimino.rot < 0) {
              activeTetrimino.rot = 3
            }
          }
        }
      }
    }
  }
  for (var i = 0; i < t.length; i++) {
    for (var j = 0; j < t[i].length; j++) {
      if (t[i][j]) {
        visualboard[activeTetrimino.y+i][activeTetrimino.x+j] = [true, colors[activeTetrimino.index]];
      }
    }
  }

  if (stop) {
    activeTetrimino.index = -1;
    tempLines = 0;
    for (var i = 0; i < boardSize[1]; i++) {
      full = true
      for (var j = 0; j < boardSize[0]; j++) {
        if (!visualboard[i][j][0]) {
          full = false
        }
      }
      if (full) {
        lines++
        tempLines++
        for (var j = i; j > 0; j--) {
          for (var k = 0; k < boardSize[0]; k++) {
            visualboard[j][k] = visualboard[j-1][k]
          }
        }
        for (var j = 0; j < boardSize[0].length; j++) {
          visualboard[0][j] = [false, "#000"]
        }
        i= 0
      }
    }
    if (tempLines > 0) {
      score += 300*Math.pow(3,tempLines-1)
    }
    permboard = JSON.parse(JSON.stringify(visualboard))
  }


  lastAction = [0,0,0]
  drawBoard()
  setTimeout(gameLoop, 1)
}

function setup() {
  resizeBoard()
  window.onresize = resizeBoard;
  for (var i = 0; i < boardSize[1]; i++) {
    visualboard[i] = []
    permboard[i] = []
    for (var j = 0; j < boardSize[0]; j++) {
      visualboard[i][j] = [false, "#000"]
      permboard[i][j] = [false, "#000"]
    }
  }
  drawBoard()
  document.addEventListener("keypress", function(e){
    if (Object.keys(activeKeys).indexOf(e.key) > -1) {
      activeKeys[e.key] = true
    }
  });
  setTimeout(gameLoop, 10)
  lastGrav = Date.now()
}

setTimeout(setup, 100) // dealing with document loading time.
