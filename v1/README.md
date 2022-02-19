# tetr v1

Web based tetr with online high scores.

Frontend in vanilla HTML, CSS, JS.

Backend in Nodejs using express.

### Todo:

1. line gotten animation
1. general code cleanup (eslint and commenting)
1. hard drop
1. difficult modifiers in menu?
   - 7bag?
   - speed modifier
   - speed increase based on lines
   - next block(s)?
1. save name and keybinds in local storage
1. keybind for pause button
1. reset button
1. ghost blocks (show where the block would go if you didnt touch the keys)

### Backend Issues:

1. No login so anyone can submit under any name.
1. No authentication to make sure the scores are real. Only good solution I have for this is having server verification for all actions, and random piece generation being done on the server side. This becomes pretty complex though. I would also want logins for this to really be able to keep track of sessions. Overall its just way too complex for a simple project like this.
1. Should be using a DB for the data rather then a json file.
1. Should be using a webserver for serving the static pages.
1. no HTTPS.
