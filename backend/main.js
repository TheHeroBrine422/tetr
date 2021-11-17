const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

var scores = []

paramRegex = {"name": /[a-zA-z ]*/,
              "score": /[0-9]{1,64}/,
              "lines": /[0-9]{1,64}/,
              "date": /[0-9]{1,64}/}

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
  setInterval(saveScores, 60*1000*5)
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
  if (checkParams(res, req.body, ["name", "score", "lines", "date"])) {
    scores.push(req.body)
    res.send("success")
    saveScores()
  }
});

function saveScores() {
  fs.writeFileSync("scores.json", JSON.stringify(scores))
}
