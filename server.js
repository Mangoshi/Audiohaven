// Trying to fix hosting
// https://medium.com/netscape/deploying-a-vue-js-2-x-app-to-heroku-in-5-steps-tutorial-a69845ace489
let express = require('express')
let path = require('path');
let serveStatic = require('serve-static')

let app = express()

app.use(serveStatic(__dirname + "/dist"))
let port = process.env.PORT || 5000
app.listen(port);console.log('server started '+ port)