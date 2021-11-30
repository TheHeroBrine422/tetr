const express = require('express')
const fs = require('fs')
const { Pool } = require('pg')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");
const tetriminos = require('./../shared/tetriminos')
const crypto = require('crypto');

settings = JSON.parse(fs.readFileSync("Settings.json", 'utf8'))
privJWTKey = fs.readFileSync(settings.JWT.private, 'utf8')
pubJWTKey = fs.readFileSync(settings.JWT.public, 'utf8')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  "user": "jonescal",
  "host": "localhost",
  "database": "tetris",
  "password": "secretpassword",
  "port": 5432
})

paramRegex = {"username": /[a-zA-Z0-9]*/,
              "id": /[a-f0-9]{128}/,
              "password": /[^]*/,
              "date": /[0-9]{1,64}/,
              "AITrainData": /[^]*/,
              "hash": /[a-z0-9]*/}

errors = {100: "Invalid Number of parameters.",
          101: "Invalid Parameter.",
          102: "Invalid authorization.",
          104: "Spot in use.",
          106: "Invalid csrf token",
          105: "User already has a spot.",
          107: "DB Error",
          108: "Spot not in use.",
          109: "Invalid google account."}

function error(id, extra) {
  if (extra != null) {
    return JSON.stringify({"err": id, "msg": errors[id], "extra": extra})
  }
  return JSON.stringify({"err": id, "msg": errors[id]})
}

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

function verifyToken(res, access, token, callback) {
  if (token != null && token != "") {
    token = token.split(" ")[1] // remove bearer
    if (token != null && token != "") {
      regexTest = token.match(/[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*/)
      if (regexTest != null && token == regexTest[0]) {
        try { // deal with error from invalid tokens
          jwtObj = jwt.verify(token, pubJWTKey, { algorithms: settings.JWT.algo})
        } catch {
          console.log("failed verifcation")
          res.status(401).send(error(102))
          return
        }
        pool.query('SELECT * FROM users WHERE ID=$1', [jwtObj.ID], (err, DBres) => {
          if (err) {
            console.log(err)
            res.status(400).send(error(107, JSON.stringify(err)))
          } else {
            if (DBres.rows == null || DBres.rows[0] == null) {
              console.log("failed select")
              res.status(401).send(error(102))
            } else {
              if (DBres.rows[0].access < access) {
                console.log("failed access")
                res.status(401).send(error(102))
              } else {
                callback(DBres.rows[0])
              }
            }
          }
        });
      } else {
        console.log("failed regex")
        res.status(401).send(error(102))
      }
    } else {
      console.log("failed split")
      res.status(401).send(error(102))
    }
  } else {
    console.log("no token")
    res.status(401).send(error(102))
  }
}


app.listen(3003, () => {

});

app.get('/', (req, res) => {
  fs.readFile("../frontend/index.html", (err, data) => {
    res.send(data.toString());
  });
});

app.post('/api/createAccount', (req, res) => {
  if (checkParams(res, req.body, ["username"])) {
    ID = crypto.createHash('sha512').update(req.body.username+Math.random().toString()+Date.now()).digest('hex');
    pool.query('INSERT INTO users (ID, USERNAME) VALUES ($1, $2)', [ID, req.body.username], (err, DBres) => {
      if (err) {
        console.log(err)
        res.status(400).send(error(107, JSON.stringify(err)))
      } else {
        token = jwt.sign({"ID": ID}, privJWTKey, { algorithm: settings.JWT.algo});
        res.send(token)
      }
    });
  }
});

app.post('/api/setPassword', (req, res) => {
  if (checkParams(res, req.body, ["id", "password"])) {
    verifyToken(res, 0, req.headers.authorization, (user) => {
      if (user.ID == req.body.id) {
        bcrypt.hash(req.body.password, settings.saltRounds, function(err, hash) {
          pool.query('UPDATE users SET PASSWORD_HASH=$1, SALT=$2 WHERE ID=$3', [hash, user.email, req.body.ID], (err, DBres) => {
            if (err) {
              console.log(err)
              res.status(400).send(error(107, JSON.stringify(err)))
            } else {
              res.send(JSON.stringify({"msg":"success"}))
            }
          });
        });
      } else {
        res.status(400).send(error(102))
      }
    });
  }
});
