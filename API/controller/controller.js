const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require('jsonwebtoken')
const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client");
const { post, connect } = require("../routes/routes");
require("dotenv").config();

const prisma = new PrismaClient()
const lengthErr = "must be between 1 and 30 characters.";

const validateUser = [
	body("username")
		.trim()
		.isLength({ min: 1, max: 15 })
		.withMessage(`Username ${lengthErr}`),
	body("email").trim().isEmail().withMessage("Email is not valid"),
	body("confirm_password")
		.custom((value, { req }) => {
			return value === req.body.password;
		})
		.withMessage(`Passwords did not match`),
];

passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			//Attempted prisma query
			const user = await prisma.users.findUnique({
				where: {
					username: username,
				},
			});
			console.log(user);
			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			}
            if(user.password !== password){
                return done(null, false, { message: "Incorrect password" })
            }
			// const match = await bcrypt.compare(password, user.password);
			// if (!match) {
			// 	return done(null, false, { message: "Incorrect password" });
			// }
			return done(null, user);
		} catch (err) {
			console.log("fail");
			return done(err);
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		//Attempted prisma query
		const user = await prisma.users.findUnique({
			where: {
				id: id,
			},
		});

		done(null, user);
	} catch (err) {
		done(err);
	}
});

function verifyToken(req, res, next){
    const bearerHeader = req.headers['authorization']
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1]
        req.token = bearerToken
        console.log('token cleared')
        next()
        return
    } else {
        //Forbidden
        res.sendStatus(403)
    }
}

async function getArticles(req, res){
    const articles = await prisma.articles.findMany()
    res.json(articles)
}

async function getArticlesById(req, res){
    const id = req.params.id
    const article = await prisma.articles.findMany({
        where: {
            id: Number(id)
        }
    })
    const comments = await prisma.comments.findMany({
        where:{
            articleId: Number(id)
        }
    })
    console.log(comments)
    res.json({
        article: article,
        commnets: comments
    })
}

//Add validation when frontend is up
// const postSignUp = [
// 	validateUser,
// 	async function (req, res, next) {
// 		const errors = validationResult(req);
// 		if (!errors.isEmpty()) {
// 			return res.status(400).render("sign-up", {
// 				title: "Sign Up",
// 				errors: errors.array(),
// 			});
// 		}
// 		try {
// 			console.log(req.body);
// 			const hashedPassword = await bcrypt.hash(req.body.password, 10);
// 			console.log(hashedPassword);
// 			const user = await prisma.users.create({
// 				data: {
// 					username: req.body.username,
// 					email: req.body.email,
// 					password: hashedPassword,
// 				},
// 			});
// 			console.log(user);
// 			res.redirect("/");
// 		} catch (err) {
// 			return next(err);
// 		}
// 	},
// ];
async function addNewUser(req, res){
    //mock
    //replace with req.body
    const user = {
        username: "Admin",
        password: "Admin",
        email: "admin@admin.com"
    }
    const newUser = await prisma.users.create({
        data:{
            username: user.username,
            password: user.password,
            email: user.email
        }
    })
    console.log(newUser)
}

const login = [
    passport.authenticate('local'),
    function (req, res) {
        console.log('login successful')
        //mock
        console.log(req.user)
        const user = {
            username: "Admin",
            password: "Admin",
            email: "admin@admin.com"
        }
        jwt.sign({user}, 'secretkey', {expiresIn: '3000s' }, (err, token) =>{
            //stores token in localStorage (not tested yet)
            // const token = localStorage.getItem('jwt') to get token
            // localStorage.setItem('jwt', token)
            res.json({
                token
            })
            console.log(token)
        })
        console.log('token granted')
    }
]

const postArticle = [
    verifyToken,
    async function(req, res){
        console.log('token verified')
        // LATER LOOK INTO STANDARD FOR ASYNC/PROMISES AND JWT.VERIFY
        jwt.verify(req.token, 'secretkey', (err, authData)=> {
            if(err){
                res.sendStatus(403)
            } else {
                const user = authData.user
                console.log(req.body)
                res.send(req.body)
                addArticle(user, req.body)
            }
        })
    }
]
//For adding new articles
async function addArticle(user, data){
    const newArticle = await prisma.articles.create({
        data:{
            title: data.title,
            content: data.content,
            author: {
                connect: {
                    username: user.username
                }
            }
        }
    })
    console.log(newArticle)
}

const updateArticle = [
    verifyToken,
    async function(req, res) {
        jwt.verify(req.token, 'secretkey', (err, authData) =>{
            if(err){
                res.sendStatus(403)
            } else {
                const id = req.params.id
                res.send(req.body)
                updateArticleById(id, req.body)
            }
        })
    }
]

//For updating articles
async function updateArticleById(id, data) {
    const article = await prisma.articles.update({
        where: {
            id: Number(id)
        },
        data: {
            title: data.title,
            content: data.content,
            published: data.published
        }
    })
    console.log(article)
}


// COMMENTS FUNCTIONS
const postComment = [
    verifyToken,
    async function(req, res){
        console.log('token verified')
        // LATER LOOK INTO STANDARD FOR ASYNC/PROMISES AND JWT.VERIFY
        jwt.verify(req.token, 'secretkey', (err, authData)=> {
            if(err){
                res.sendStatus(403)
            } else {
                const user = authData.user
                const id = req.params.id
                console.log(req.body)
                res.send(req.body)
                addComment(user, id, req.body)
            }
        })
    }
]

async function addComment(user, aritcle_id, data){
    const newComment = await prisma.comments.create({
        data: {
            comment: data.content,
            commenter: {
                connect: {
                    username: user.username
                }
            },
            article: {
                connect: {
                    id: Number(aritcle_id)
                }
            }
        }
    })
    console.log(newComment)
}

const updateComment = [
    verifyToken,
    async function(req, res) {
        jwt.verify(req.token, 'secretkey', (err, authData) =>{
            if(err){
                res.sendStatus(403)
            } else {
                const id = req.params.id
                console.log(id)
                res.send(req.body)
                updateCommentById(id, req.body)
            }
        })
    }
]

//For updating comments
async function updateCommentById(id, data) {
    const comments = await prisma.comments.update({
        where: {
            id: Number(id)
        },
        data: {
            comment: data.content
        }
    })
    console.log(comments)
}

// LIKING COMMENTS/ARTICLES
// create like entry to the database
// count total likes for a given comment/article
// set the total_likes to that count

const likeArticle = [
    verifyToken,
    async function(req, res) {
        jwt.verify(req.token, 'secretkey', (err, authData) =>{
            if(err){
                res.sendStatus(403)
            } else {
                const id = req.params.id
                const user = authData.user
                // console.log(id)
                // console.log(user)
                likeArticleById(id, user)
                updateLikesForArticle(id)
            }
        })
    }
]

//Need to make this unique to users can't repeatedly add likes to article
async function likeArticleById(article_id, user) {
    const liker = await prisma.articleLikes.create({
        data:{
            article: {
                connect: {
                    id: Number(article_id)
                }
            },
            liker: {
                connect: {
                    username: user.username
                }
            },
            liked: true
        }
    })
    console.log(liker)
}

async function getLikesForArticle(article_id) {
    const likes = await prisma.articleLikes.count({
        where: {
            liked: true,
            articleId: Number(article_id)
        }
    })
    return likes
}

async function updateLikesForArticle(article_id) {
    const likesCount = await getLikesForArticle(article_id)
    console.log(likesCount)
    const article = await prisma.articles.update({
        where:{
            id: Number(article_id)
        },
        data: {
            total_likes: likesCount
        }
    })
    console.log(article)
}

module.exports = {
    passport,
    getArticles,
    addNewUser,
    login,
    postArticle,
    updateArticle,
    getArticlesById,
    postComment,
    updateComment,
    likeArticle
}