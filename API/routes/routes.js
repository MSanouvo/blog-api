const { Router } = require('express')
const controller = require('../controller/controller')
const index = Router()

index.get('/api/articles', controller.getArticles)
index.post('/api/articles/new', controller.postArticle)
index.post('/api/user/sign-up', controller.addUser)
index.post('/api/user/login', controller.login)


module.exports = index