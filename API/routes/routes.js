const { Router } = require('express')
const controller = require('../controller/controller')
const index = Router()

//basic routes for articles (content)
index.get('/api/articles', controller.getArticles)
index.post('/api/articles/new', controller.postArticle)
index.get('/api/articles/:id', controller.getArticlesById)
index.put('/api/articles/:id', controller.updateArticle)
index.delete('/api/articles/:id', controller.deleteArticle)

index.get('/api/user/articles', controller.getUserArticles)

//basic routes for article comments
index.post('/api/articles/:id/comment', controller.postComment)
index.put('/api/articles/:id/comment/:id', controller.updateComment)
index.delete('/api/articles/:id/comment/:id', controller.deleteComment)

// basic routes for article likes
index.post("/api/articles/:id/like", controller.likeArticle)
index.post('/api/articles/:id/comment/:id/like', controller.likeComment)
index.delete("/api/articles/:id/like", controller.deleteArticleLike)
index.delete('/api/articles/:id/comment/:id/like', controller.deleteCommentLike)

//User creation/authentication routes
index.post('/api/user/sign-up', controller.signUp)
index.post('/api/user/login', controller.login)

//User Routes
index.post('/api/user', controller.getUser)


module.exports = index