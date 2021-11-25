const express = require('express')
const fs = require('fs')
const { Pool } = require('pg')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");
const tetriminos = require('./../shared/tetriminos')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

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
