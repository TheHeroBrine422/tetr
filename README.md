# tetris

Web based tetris with online high scores.

Frontend in vanilla HTML, CSS, JS.

Backend in Nodejs using express.

### Todo:

1. changeable keybinds
1. line gotten animation
1. general code cleanup (eslint and commenting)

### Backend Issues:

1. No login so anyone can submit under any name.
1. No authentication to make sure the scores are real.
  * Only good solution I have for this is having server verification for all actions, and random piece generation being done on the server side. This becomes pretty complex though. I would also want logins for this to really be able to keep track of sessions. Overall its just way too complex for a simple page like this.
1. Should be using a DB for the data rather then a json file.
1. Should be using a webserver for serving the static pages.
1. no HTTPS.
