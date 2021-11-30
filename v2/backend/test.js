const axios = require('axios')
const fs = require('fs')
const { Pool } = require('pg')
const jwt = require('jsonwebtoken')

//settings = JSON.parse(fs.readFileSync("../Settings.json"))
//privJWTKey = fs.readFileSync("../"+settings.JWT.private, 'utf8')
//JWTs = {"3": jwt.sign({"email": "parkingdev@bentonvillek12.org"}, privJWTKey, { algorithm: settings.JWT.algo})};
APIURL = "http://localhost:3003/api/";

(async () => {
  res = await postNOJWT("createAccount", {"username": "Hero"})
  console.log(res)
})();

async function get(route, params, JWT) {
  return await axios.get(APIURL+route, {params: params, headers: {authorization: "Bearer "+JWT}})
  .catch(function (error) {
    return error
  })
}

async function post(route, params, JWT) {
  const URLParams = new URLSearchParams();
  for (var i = 0; i < Object.keys(params).length; i++) {
    key = Object.keys(params)[i]
    URLParams.append(key, params[key])
  }
  return await axios.post(APIURL+route, URLParams, {headers: {authorization: "Bearer "+JWT}})
  .catch(function (error) {
    return error
  })
}

async function postNOJWT(route, params) {
  const URLParams = new URLSearchParams();
  for (var i = 0; i < Object.keys(params).length; i++) {
    key = Object.keys(params)[i]
    URLParams.append(key, params[key])
  }
  return await axios.post(APIURL+route, URLParams)
  .catch(function (error) {
    return error
  })
}
