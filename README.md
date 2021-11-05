# tetris

Web based tetris with online high scores.

Frontend in vanilla HTML, CSS, JS.

Backend in Nodejs using express.

### Todo:

1. changeable keybinds
1. line gotten animation
2. general code cleanup (eslint and commenting)
1. seperate high score page for watching high scores

### Backend Issues:

1. No login so anyone can submit under any name.
1. No authentication to make sure the scores are real.
  * Only good solution I have for this is having the random pieces being generated on the backend and then moved being sent to the backend to verify that the actions the user took match the front end. this becomes pretty complex though. I would also want logins for this to really be able to keep track of sessions. Overall its just way too complex for a simple page like this.
1. Should be using a DB for the data rather then a json file.
1. Should be using a webserver for serving the static pages
1. no HTTPS
