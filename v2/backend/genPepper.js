const crypto = require('crypto')

startHashes = []
numStartHashes = Math.random()*1000000+100000

for (var i = 0; i < numStartHashes; i++) {
  startHashes[i] = crypto.createHash('sha512').update(crypto.randomBytes(Math.pow(Math.floor(Math.random()*16+16),2)).toString()+process.hrtime()[1].toString()+process.hrtime()[0].toString()).digest('hex');
}

finHash = startHashes[0]
for (var i = 1; i < numStartHashes; i++) {
  finHash = crypto.createHash('sha512').update(finHash.toString()+startHashes[i].toString()).digest('base64');
}

console.log(finHash)
