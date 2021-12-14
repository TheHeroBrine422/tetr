let boardSize = [10, 20]
let visualboard = []
let permboard = []
let blockSize = 1
let speed = 300
let lastGrav = 0;
let activeKeys = {"up": false, "left": false, "down": false, "right": false}
let keybinds = [["w", "up"], ["a", "left"], ["s", "down"], ["d", "right"]]
let lastAction; // [x,y,rot]
let activeTetrimino
let score;
let lines;
let colors = ["#00ffff", "#0000ff", "#ff7f00", "#ffff00", "#00ff00", "#800080", "#ff0000"]
let submitted;
let keybindChangeData = [false, '']
let gameLoopId = -1
let inMenu = false
let gameend;
let lastVisualboard = []
let actions = ["left", "up", "right"]
let diffChange = false

function resizeBoard() {
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  blockSize = Math.min(Math.floor(window.innerHeight/boardSize[1]), Math.floor(window.innerWidth/boardSize[0]))
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
  fixedrot = false
  changed = false
  lastVisualboard = JSON.parse(JSON.stringify(visualboard))
  visualboard = JSON.parse(JSON.stringify(permboard)) // dealing with reference copying
  numChanges = 0

  if (activeTetrimino.index == -1) {
    activeTetrimino.index = Math.floor(Math.random()*tetriminos.length)
    activeTetrimino.rot = 0;
    activeTetrimino.y = 0;
    activeTetrimino.x = 4;
    if (activeTetrimino.index == 0) { // deal with line block special case
      activeTetrimino.y--
    }
  }

  let s = speed // gravity
  if (activeKeys["down"]) {
    s = speed/4
    activeKeys["down"] = false
  }

  if (lastGrav+s < Date.now()) {
    lastGrav = Date.now()
    lastAction[1] = 1
    activeTetrimino.y++;
  }

  for (var i = 0; i < actions.length; i++) {
    item = actions[i]
    if (lastAction[0] == 0 && lastAction[1] == 0 && lastAction[2] == 0) {
      if (item == "up" && activeKeys[item]) {
        lastAction[2] = 1
        activeTetrimino.rot++;
        activeTetrimino.rot = activeTetrimino.rot % 4;
        activeKeys[item] = false
      } else if (item == "left" && activeKeys[item]) {
        lastAction[0] = -1
        activeTetrimino.x--;
        activeKeys[item] = false
      } else if (item == "right" && activeKeys[item]) {
        lastAction[0] = 1
        activeTetrimino.x++;
        activeKeys[item] = false
      }
    } else {
      break
    }
  }

  t = JSON.parse(JSON.stringify(tetriminos[activeTetrimino.index][activeTetrimino.rot]))

  for (var i = 0; i < t.length; i++) { // collision detection
    for (var j = 0; j < t[0].length; j++) {
      if (t[i][j]) {
        if (activeTetrimino.y+i >= visualboard.length) { // hit ground
          stop = true;
          activeTetrimino.y--;
        }
        if (activeTetrimino.y+i >= boardSize[1] || activeTetrimino.y+i < 0 || activeTetrimino.x+j >= boardSize[0] || activeTetrimino.x+j < 0 || visualboard[activeTetrimino.y+i][activeTetrimino.x+j][0]) { // hitting walls or other blocks
          if (lastAction[1] == 1) {
            stop = true;
            activeTetrimino.y--;
            changed = true
          } else if (lastAction[0] == 1) {
            activeTetrimino.x--;
            changed = true
          } else if (lastAction[0] == -1) {
            activeTetrimino.x++;
            changed = true
          } else if (lastAction[2] == 1) {
            changed = true
            if (!fixedrot) {
              activeTetrimino.rot--;
              i = 0
              j = 0
              fixedrot = true
            } else {
              if (activeTetrimino.x+j < 1) {
                activeTetrimino.x++
                activeTetrimino.rot++
              } else if (activeTetrimino.x+j > 8) {
                activeTetrimino.x--
                activeTetrimino.rot++
              }
            }
            n = 4
            activeTetrimino.rot = ((activeTetrimino.rot % n) + n) % n // deal with stupid negative modulos
          } else { // hitting top or something really broke
            gameend = true
            activeTetrimino.y--
          }
        }
        if (changed) {
          t = JSON.parse(JSON.stringify(tetriminos[activeTetrimino.index][activeTetrimino.rot]))
          changed = false
          i = 0
          j = 0
          numChanges++
          if (numChanges > 10) {
            t = [[""]] // t is probably not valid
            gameend = true
            i = 100
            j = 100
            console.log("end")
          }
        }
      }
    }
  }

  for (var i = 0; i < t.length; i++) { // add tetrimino to board
    for (var j = 0; j < t[i].length; j++) {
      if (t[i][j]) {
        if (!(activeTetrimino.y+i >= boardSize[1] || activeTetrimino.y+i < 0 || activeTetrimino.x+j >= boardSize[0] || activeTetrimino.x+j < 0)) { // array bounds
          visualboard[activeTetrimino.y+i][activeTetrimino.x+j] = [true, colors[activeTetrimino.index]];
        } else {
          gameend = true
        }
      }
    }
  }

  if (stop) {
    activeTetrimino.index = -1;

    tempLines = 0;
    for (var i = 0; i < boardSize[1]; i++) { // line detection
      full = true
      for (var j = 0; j < boardSize[0]; j++) { // check if line is full
        if (!visualboard[i][j][0]) {
          full = false
        }
      }
      if (full) {
        lines++
        tempLines++
        for (var j = i; j > 0; j--) { // deal with moving the rows around to move things down
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
  if (JSON.stringify(lastVisualboard) != JSON.stringify(visualboard)) { //only draw on changed frame
    drawBoard()
  }
  if (!gameend) {
    gameLoopId = setTimeout(gameLoop, 1)
  } else {
    gameOver()
  }
}

function firstSetup() {
  window.onresize = resizeBoard;
  document.addEventListener("keydown", function(e){
    if (keybindChangeData[0]) {
      document.getElementById("keybind-"+keybindChangeData[1]).innerText = e.key
      for (var i = 0; i < keybinds.length; i++) {
        if (keybinds[i][1] == keybindChangeData[1]) {
          keybinds[i][0] = e.key
        }
      }
      keybindChangeData = [false, '']
    } else if (!inMenu) {
      for (var i = 0; i < keybinds.length; i++) {
        if (keybinds[i][0] == e.key) {
          activeKeys[keybinds[i][1]] = true
        }
      }
    }
  });
  var endGameModal = document.getElementById("endGameModal");
  var endGameClose = document.getElementsByClassName("close")[0];
  var menuModal = document.getElementById("menuModal");
  var menuClose = document.getElementsByClassName("close")[1];

  endGameClose.onclick = function() {
    endGameModal.style.display = "none";
    restart()
  }

  menuClose.onclick = function() {
    menuModal.style.display = "none";
    gameLoopId = setTimeout(gameLoop, 1)
    inMenu = false
    if (diffChange) {
      restart()
    }
  }

  window.onclick = function(event) {
    if (event.target == endGameModal) {
      endGameModal.style.display = "none";
      restart()
    } else if (event.target == menuModal) {
      menuModal.style.display = "none";
      gameLoopId = setTimeout(gameLoop, 1)
      inMenu = false
      if (diffChange) {
        restart()
      }
    }
  }
  setup()
}

function setup() {
  diffChange = false
  gameend = false
  document.getElementById("error").innerText = ""
  score = 0;
  lines = 0;
  drawHighScores()
  resizeBoard()
  document.getElementById("endGameModal").style.display = "none";
  activeTetrimino = {
    x: -1,
    y: -1,
    index: -1,
    rot: 0,
  }
  lastAction = [0,0,0]
  submitted = false
  for (var i = 0; i < boardSize[1]; i++) {
    visualboard[i] = []
    permboard[i] = []
    for (var j = 0; j < boardSize[0]; j++) {
      visualboard[i][j] = [false, "#000"]
      permboard[i][j] = [false, "#000"]
    }
  }
  drawBoard()
  setTimeout(gameLoop, 10)
  lastGrav = Date.now()
}

function gameOver() {
  submitted = false
  document.getElementById("endscore").innerText = "Score: "+score.toLocaleString("en-US");
  document.getElementById("endlines").innerText = "Lines: "+lines
  document.getElementById("error").innerText = ""

  document.getElementById("endGameModal").style.display = "block";
}

function submitScore() {
  if (document.getElementById("name").value == "") {
    document.getElementById("error").innerText = "Error: Invalid Name"
  } else if (submitted) {
    document.getElementById("error").innerText = "Error: Already Submitted"
  } else {
    const URLParams = new URLSearchParams();
    URLParams.append("score", score)
    URLParams.append("lines", lines)
    URLParams.append("name", document.getElementById("name").value)
    URLParams.append("date", Date.now())
    fetch(window.location.origin+'/submitScore', { method: 'POST', body: URLParams})
    .then(response => response.text())
    .then(data => {
      if (data != "success") {
        if (data.includes("name")) {
          document.getElementById("error").innerText = "Error: Invalid Name"
        } else {
          document.getElementById("error").innerText = "Error: Submission Failed. Please Try Again."
          console.log('Error:', error);
        }
      } else {
        document.getElementById("error").innerText = ""
        submitted = true
        drawHighScores()
      }
    })
    .catch((error) => {
      document.getElementById("error").innerText = "Error: Submission Failed. Please Try Again."
      console.error('Error:', error);
    });
  }
}

function restart() {
  submitScore()
  setup()
}

function drawHighScores() {
  fetch(window.location.origin+'/getScores')
  .then(response => response.json())
  .then(data => {
    data.sort((a, b) => Number(b.score) - Number(a.score));
    HS = "<tr>"
    HS += "  <th>Name</th>"
    HS += "  <th>Score</th>"
    HS += "  <th>Lines</th>"
    HS += "</tr>"
    for (var i = 0; i < Math.min(data.length, 10); i++) {
      HS += "<tr>"
      HS += "  <td>"+data[i].name+"</td>"
      HS += "  <td>"+Number(data[i].score).toLocaleString("en-US")+"</td>"
      HS += "  <td>"+data[i].lines+"</td>"
      HS += "</tr>"
    }
    document.getElementById("highScores").innerHTML = HS
  })
}

function menuModal() {
  var menuModal = document.getElementById("menuModal");
  menuModal.style.display = "block";

  inMenu = true
  clearTimeout(gameLoopId)

  return false;
}

function changeKeybind(k) {
  document.getElementById("keybind-"+k).innerText = "Press new Key."
  keybindChangeData = [true, k]
}

setInterval(drawHighScores, 1000)

window.addEventListener('load', function () {
  setTimeout(firstSetup, 100)
})
