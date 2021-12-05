# tetris v2

Backend state controlled tetris.

Node based backend using express and postgress

HTML, CSS, and JS based frontend using no libraries.

# Todo List:
1. Do everything
2. email verification should be added via nodemailer.

# Password Security:

I probably went a bit crazy on this but it was fun so I did it.

### Setup stuff:

1. The number of salt rounds for bcrypt is determined based off the speed of the hardware that the server is being ran off of. This is based on settings.bcrypt.minTimePerPHash which is the minimum time in milliseconds for the hash to take, and settings.bcrypt.minSaltRounds which is the lowest salt rounds that the server could use. This is to keep the number of salt rounds high, while still keeping the server runnable.
1. The pepper (a secret separate salt applied to all passwords) is hashed with bcrypt with salt rounds being equal to settings.bcrypt.pepperSaltRounds. This is recommened to be higher then the password salt rounds since this will only be done once. This forces attackers to find the pepper in addition to bruteforcing each password. This could be done through bruteforce, or finding a RCE vulnerability in the backend. It would be better to store seperate peppers for each user, but that requires either running a separate database or something and I am not willing to do that much work.


### on every password:

1. The Client hashes the password with SHA512 to keep the raw password off the server.
1. The Server hashes the SHA512 hashed password concatenated with the bcrypt hashed pepper with SHA512.
1. The Server hashes the SHA512 hashed password pepper combination with bcrypt with a salt.
1. This final bcrypt hash is the final password hash. It can now be stored, or be verified against the original password hash.

Theoretically this approach forces a attacker who has DB access to bruteforce the pepper first by creating a user account with a known password. They could then steal the hash and salt this generates out of the DB and use this to bruteforce the pepper. Bruteforcing the pepper, if the salt rounds are high enough, could take a very long time. Then once they do that they then still need to do a normal brute force on the bcrypt passwords. This is also a new hashing scheme for passwords, as far as i am aware, meaning that a attacker will need to write their own bruteforce program.

If a RCE vulnerability is found instead of a vulnerability that just allows DB access, the pepper does not add extra security. Uncommon passwords should still be secure without the pepper, but common passwords will likely be easily bruteforced with a known pepper.
