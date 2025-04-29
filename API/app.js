const express = require('express')
const path = require('node:path')
const router = require('./routes/routes')
const session = require("express-session")
const controller = require('./controller/controller')


const app = express()
const PORT = 3000

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }))
app.use(controller.passport.session())
app.use(express.urlencoded({ extended: false}))


app.use('/', router)

app.listen(PORT, () =>{
    console.log(`Server Running at port: ${PORT}`)
})