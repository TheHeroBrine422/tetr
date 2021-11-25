const express = require('express')
const fs = require('fs')
const pako = require('pako')
const bodyParser = require('body-parser')
var compression = require('compression')


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression())

var scores = []
var AIData = []

paramRegex = {"name": /[a-zA-z ]*/,
              "score": /[0-9]{1,64}/,
              "lines": /[0-9]{1,64}/,
              "date": /[0-9]{1,64}/,
              "AITrainData": /[^]*/, 
              "hash": /[a-z0-9]*/}

function checkParams(res, params, paramList) {
  if (Object.keys(params).length != paramList.length) {
    res.status(400).send("Invalid parameters")
    return false;
  }
  for (var i = 0; i < paramList.length; i++) {
    if (params[paramList[i]] == null || params[paramList[i]] == "" || params[paramList[i]].match(paramRegex[paramList[i]]) == null || params[paramList[i]].match(paramRegex[paramList[i]])[0] != params[paramList[i]]) {
      res.status(400).send("Invalid parameters")
      return false;
    }
  }
  return true;
}

app.listen(3003, () => {
  if (fs.existsSync("scores.json")) {
    scores = JSON.parse(fs.readFileSync("scores.json"))
  }
  if (fs.existsSync("AIdata.json")) {
    AIData = JSON.parse(fs.readFileSync("AIdata.json"))
  }
  setInterval(saveScores, 60*1000*5)
  setTimeout(pruneAIData,1000, 30*60*1000)
  setInterval(pruneAIData, 60*1000*30, 30*60*1000)
});

app.get('/', (req, res) => {
  fs.readFile("../frontend/index.html", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/highScores', (req, res) => {
  fs.readFile("../frontend/highScores.html", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/main.js', (req, res) => {
  fs.readFile("../frontend/main.js", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/tetriminos.js', (req, res) => {
  fs.readFile("../frontend/tetriminos.js", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/style.css', (req, res) => {
  fs.readFile("../frontend/style.css", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/AI', (req, res) => {
  fs.readFile("../frontend/AI/AI.html", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/AITetris.js', (req, res) => {
  fs.readFile("../frontend/AI/AITetris.js", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/nn.js', (req, res) => {
  fs.readFile("../frontend/AI/nn.js", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/imurmurhash.min.js', (req, res) => {
  fs.readFile("../frontend/AI/imurmurhash.min.js", (err, data) => {
    res.send(data.toString());
  });
});

app.get('/getScores', (req, res) => {
  res.send(JSON.stringify(scores))
});

app.post('/submitScore', (req, res) => {
  console.log(req.body)
  if (checkParams(res, req.body, ["name", "score", "lines", "date", "hash"])) {
    scores.push(req.body)
    res.send("success")
    saveScores()
  }
});

app.post('/AIData', (req, res) => {
  if (checkParams(res, req.body, ["AITrainData", "hash", "date"])) {
    AITrainData = JSON.parse(req.body.AITrainData)
    newData = ""
    for (var i = 0; i < AITrainData[2].length; i++) {
      for (var j = 0; j < AITrainData[2][0].length; j++) {
        newData += AITrainData[2][i][j][0] ? "1" : "0"
      }
    }
    AIData.push({"h": req.body.hash, "a":AITrainData[0], "m": AITrainData[1], "b": newData, "t":req.body.date})
    res.send("success")
    saveAIData()
  }
});

function saveScores() {
  fs.writeFileSync("scores.json", JSON.stringify(scores))
}


function saveAIData() {
  fs.writeFileSync("AIdata.json", JSON.stringify(AIData))
}

function pruneAIData(wait) {
  for (var i = 0; i < AIData.length; i++) {
    if ((Number(AIData[i].t)+wait) < Date.now()) {
      index = -1
      for (var j = 0; j < scores.length; j++) {
        if (AIData[i].h == scores[j].hash) {
          index = j
        }
      }
      if (index > -1) {
        if (scores[index].score < 5000 || scores[index].lines < 10) {
          AIData.splice(i, 1)
          i--
        }
      } else {
        AIData.splice(i, 1)
        i--
      }
    }
  }
  saveAIData()
}
