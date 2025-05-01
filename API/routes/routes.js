const { Router } = require('express')
const controller = require('../controller/controller')
const index = Router()

//basic routes for articles (content)
index.get('/api/articles', controller.getArticles)
index.post('/api/articles/new', controller.postArticle)
index.get('/api/articles/:id', controller.getArticlesById)
index.put('/api/articles/:id', controller.updateArticle)

//basic routes for article comments
index.post('/api/articles/:id/comment', controller.postComment)
index.put('/api/articles/:id/comment/:id', controller.updateComment)

// basic routes for article likes
index.post("/api/articles/:id/like", controller.likeArticle)

//User creation/authentication routes
index.post('/api/user/sign-up', controller.addNewUser)
index.post('/api/user/login', controller.login)


module.exports = index