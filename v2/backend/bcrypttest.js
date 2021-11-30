bcrypt = require('bcrypt')
password = "abcdef"

async function bcryptTest(saltRounds) {
  startTime = Date.now()
  bcrypt.hash(password, saltRounds, function(err, hash) {
    endTime = Date.now()
    console.log(saltRounds+": "+(endTime-startTime)+"ms")
  })
}

for (var i = 0; i < 20; i++) {
  bcryptTest(i)
}
