const express = require('express')
const fs = require('fs')
const { Pool } = require('pg')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser");
const tetriminos = require('./../shared/tetriminos')
const crypto = require('crypto');
const bcrypt = require('bcrypt')


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
              "password": /[a-f0-9]{128}/,
              "date": /[0-9]{1,64}/,
              "AITrainData": /[^]*/,
              "hash": /[a-z0-9]*/,
              "email": /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ // source: http://emailregex.com/
            }

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


app.listen(settings.port, async () => {
  console.log("Port: "+settings.port)
  hashTime = 0
  settings.saltRounds = settings.bcrypt.minSaltRounds-1
  while (hashTime < settings.bcrypt.minTimePerPHash) {
    settings.saltRounds++
    hashTime = await bcryptTest(settings.saltRounds)
  }
  console.log("Bcrypt Salt Rounds: "+settings.saltRounds)
  startTime = Date.now()
  settings.bcrypt.pepperHash = await bcrypt.hash(settings.bcrypt.pepper, settings.bcrypt.pepperSaltRounds)
  console.log("Pepper Hash Time: "+((Date.now()-startTime)/1000)+" seconds")

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
        password = crypto.createHash('sha512').update(req.body.password+settings.bcrypt.pepperHash).digest('hex');
        bcrypt.hash(password, settings.saltRounds, function(err, hash) {
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

app.post('/api/signIn', (req, res) => {
  function check(err, DBres) {
    if (err) {
      console.log(err)
      res.status(400).send(error(107, JSON.stringify(err)))
    } else {
      if (DBres != null && DBres[0] != null) {
        bcrypt.compare(req.body.password, DBres[0].PASSWORD_HASH, function(err, result) {
          if (result) {
            token = jwt.sign({"ID": ID}, privJWTKey, { algorithm: settings.JWT.algo});
            res.send(token)
          }
        })
      }
    }
  }
  if (checkParams(res, req.body, ["username", "password"])) {
    pool.query('SELECT ID, PASSWORD_HASH FROM users WHERE USERNAME=$1', [req.body.username], check);
  } else if (checkParams(res, req.body, ["email", "password"])) {
    pool.query('SELECT ID, PASSWORD_HASH FROM users WHERE EMAIL=$1', [req.body.email], check);
  }
})

async function bcryptTest(saltRounds) {
  testPass = crypto.createHash('sha256').update(Math.random().toString()+Date.now()).digest('hex');
  startTime = Date.now()
  await bcrypt.hash(testPass, saltRounds)
  return (Date.now()-startTime)
}
