const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const albumRouter = require('./routers/album')
const photoRouter = require('./routers/photo')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(albumRouter)
app.use(photoRouter)

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})