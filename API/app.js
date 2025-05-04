const express = require('express')
const router = require('./routes/routes')
const session = require("express-session")
const controller = require('./controller/controller')


const app = express()
const PORT = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }))
app.use(controller.passport.session())
app.use(express.urlencoded({ extended: false}))


app.use('/', router)

app.listen(PORT, () =>{
    console.log(`Server Running on port: ${PORT}`)
})