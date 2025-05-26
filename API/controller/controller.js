const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const lengthErr = "must be between 1 and 30 characters.";


const validateUser = [
	body("username")
		.trim()
		.isLength({ min: 1, max: 15 })
		.withMessage(`Username ${lengthErr}`),
	body("email").trim().isEmail().withMessage("Email is not valid"),
	body("passwordConfirmation")
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
			// console.log(user);
			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			}
			// if (user.password !== password) {
			// 	return done(null, false, { message: "Incorrect password" });
			// }
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				return done(null, false, { message: "Incorrect password" });
			}
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

function verifyToken(req, res, next) {
	const bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== "undefined") {
		const bearer = bearerHeader.split(" ");
		const bearerToken = bearer[1];
		req.token = bearerToken;
		next();
		return;
	} else {
		//Forbidden
		res.sendStatus(403);
	}
}

async function getArticles(req, res) {
	const articles = await prisma.articles.findMany({
		where: {
			published: true
		}
	});
	res.json(articles);
}

const getUserArticles = [
	verifyToken,
	async function (req, res, next) {
		try {
			console.log("token verified");
			const token = req.token;
			const authData = await jwt.verify(token, "secretkey");
			console.log(authData)
			const articles = await getArticlesByUserId(authData.user)
			res.json({ articles: articles })
		} catch (err) {
			console.log(err)
			res.sendStatus(403)
		}
	},
];

async function getArticlesByUserId(user, res) {
	const articles = await prisma.articles.findMany({
		where: {
			authorId: user.id,
		},
	});
	console.log(`articles from userId: ${user.id}`)
	console.log(articles);
	return articles
}

async function getArticlesById(req, res) {
	const id = req.params.id;
	const article = await prisma.articles.findMany({
		where: {
			id: Number(id),
		},
		include:{
			likes: true
		}
	});
	const comments = await prisma.comments.findMany({
		where: {
			articleId: Number(id),
		},
		include: {
			commenter: true,
		}
	});
	console.log(comments)
	res.json({
		article: article,
		comments: comments,
	});
}


const signUp = [
	validateUser,
	async function (req, res, next) {
		// console.log(req.body)
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log("invalid user");
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const user = req.body;
			const hashedPassword = await bcrypt.hash(user.password, 10);
			console.log("user");
			console.log(user);
			console.log("pw");
			console.log(hashedPassword);
			const newUser = await prisma.users.create({
				data: {
					username: user.username,
					password: hashedPassword,
					email: user.email,
				},
			});
			console.log(newUser);
			res.json({ user: newUser });
		} catch (err) {
			return next(err);
		}
	},
];

const login = [
	passport.authenticate("local"),
	function (req, res) {
		const user = req.user;
		console.log(user);
		jwt.sign(
			{ user },
			"secretkey",
			// { expiresIn: "3000s" },
			(err, token) => {
				res.json({
					token,
				});
				console.log(storedtoken);
			}
		);
		console.log("token granted");
	},
];

const postArticle = [
	verifyToken,
	async function (req, res) {
		console.log("token verified");
		// LATER LOOK INTO STANDARD FOR ASYNC/PROMISES AND JWT.VERIFY
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const user = authData.user;
				console.log(req.body);
				res.send(req.body);
				addArticle(user, req.body);
			}
		});
	},
];

async function addArticle(user, data) {
	const newArticle = await prisma.articles.create({
		data: {
			title: data.title,
			content: data.body,
			author: {
				connect: {
					username: user.username,
				},
			},
			published: data.published
		},
	});
	console.log(newArticle);
}

const updateArticle = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const id = req.params.id;
				res.json({ body: req.body });
				updateArticleById(id, req.body);
			}
		});
	},
];

async function updateArticleById(id, data) {
	const article = await prisma.articles.update({
		where: {
			id: Number(id),
		},
		data: {
			title: data.title,
			content: data.body,
			published: data.published,
		},
	});
	console.log(article);
	console.log("Article Updated");
}

// COMMENTS FUNCTIONS
const postComment = [
	verifyToken,
	async function (req, res) {
		console.log("token verified");
		// LATER LOOK INTO STANDARD FOR ASYNC/PROMISES AND JWT.VERIFY
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const user = authData.user;
				const id = req.params.id;
				console.log(req.body);
				res.send(req.body);
				addComment(user, id, req.body);
			}
		});
	},
];

async function addComment(user, aritcle_id, data) {
	const newComment = await prisma.comments.create({
		data: {
			comment: data.comment,
			commenter: {
				connect: {
					username: user.username,
				},
			},
			article: {
				connect: {
					id: Number(aritcle_id),
				},
			},
		},
	});
	console.log(newComment);
}

const updateComment = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const id = req.params.id;
				console.log(id);
				console.log(req.body)
				updateCommentById(id, req.body);
			}
		});
	},
];

//For updating comments
async function updateCommentById(id, data) {
	const comments = await prisma.comments.update({
		where: {
			id: Number(id),
		},
		data: {
			comment: data.comment,
		},
	});
	console.log(comments);
}

// LIKING COMMENTS/ARTICLES
const likeArticle = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const id = req.params.id;
				const user = authData.user;
				// console.log(id)
				// console.log(user)
				try {
					likeArticleById(id, user);
				} catch (error) {
					console.log(error)
				}
				updateLikesForArticle(id);
			}
		});
	},
];

async function likeArticleById(article_id, user) {
	try {
		const liker = await prisma.articleLikes.create({
			data: {
				article: {
					connect: {
						id: Number(article_id),
					},
				},
				liker: {
					connect: {
						username: user.username,
					},
				},
				liked: true,
			},
		});
		console.log(liker);
	} catch (error) {
		console.log(error)
	}

}

async function getLikesForArticle(article_id) {
	const likes = await prisma.articleLikes.count({
		where: {
			liked: true,
			articleId: Number(article_id),
		},
	});
	return likes;
}

async function updateLikesForArticle(article_id) {
	const likesCount = await getLikesForArticle(article_id);
	console.log(likesCount);
	const article = await prisma.articles.update({
		where: {
			id: Number(article_id),
		},
		data: {
			total_likes: likesCount,
		},
	});
	console.log(article);
}

const likeComment = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const id = req.params.id;
				const user = authData.user;
				console.log(id);
				console.log(user);
				likeCommentById(id, user);
				updateLikesForComment(id);
			}
		});
	},
];

async function likeCommentById(comment_id, user) {
	const liker = await prisma.commentLikes.create({
		data: {
			comment: {
				connect: {
					id: Number(comment_id),
				},
			},
			liker: {
				connect: {
					username: user.username,
				},
			},
			liked: true,
		},
	});
	console.log(liker);
}

async function getLikesForComment(comment_id) {
	const likes = await prisma.commentLikes.count({
		where: {
			liked: true,
			commentId: Number(comment_id),
		},
	});
	return likes;
}

async function updateLikesForComment(comment_id) {
	const likesCount = await getLikesForComment(comment_id);
	console.log(likesCount);
	const comment = await prisma.comments.update({
		where: {
			id: Number(comment_id),
		},
		data: {
			total_likes: likesCount,
		},
	});
	console.log(comment);
}

// DELETE FUNCTIONS
const deleteArticle = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const id = req.params.id;
				console.log(id);
				deleteArticleById(id);
			}
		});
	},
];

async function deleteArticleById(article_id) {
	const deletedArticle = await prisma.articles.delete({
		where: {
			id: Number(article_id),
		},
	});
}

const deleteComment = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const id = req.params.id;
				console.log(id);
				deleteCommentById(id);
			}
		});
	},
];

async function deleteCommentById(comment_id) {
	const deletedComment = await prisma.comments.delete({
		where: {
			id: Number(comment_id),
		},
	});
}

const deleteArticleLike = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const user = authData.user.id;
				const id = req.params.id;
				console.log(`removing like for article ${id}`)
				deleteArticleLikeById(id, user);
				updateLikesForArticle(id);
			}
		});
	},
];

async function deleteArticleLikeById(article_id, user) {
	const deletedArticle = await prisma.articleLikes.delete({
		where: {
			articleId_likerId: {
				articleId: Number(article_id),
				likerId: user,
			},
		},
	});
	console.log(deletedArticle)
}

const deleteCommentLike = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const user = authData.user.id;
				const id = req.params.id;
				console.log(id);
				console.log(user);
				deleteCommentLikeById(id, user);
			}
		});
	},
];

async function deleteCommentLikeById(comment_id, user) {
	const deletedArticle = await prisma.commentLikes.delete({
		where: {
			commentId_likerId: {
				commentId: Number(comment_id),
				likerId: user,
			},
		},
	});
}

const getUser = [
	verifyToken,
	async function (req, res) {
		jwt.verify(req.token, "secretkey", (err, authData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				const user = authData.user;
				res.json({ user: user });
			}
		});
	},
];
module.exports = {
	passport,
	getArticles,
	signUp,
	login,
	postArticle,
	updateArticle,
	getArticlesById,
	postComment,
	updateComment,
	likeArticle,
	likeComment,
	deleteArticle,
	deleteComment,
	deleteArticleLike,
	deleteCommentLike,
	getUser,
	getUserArticles,
};
