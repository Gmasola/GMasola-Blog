var express = require('express');
var router = express.Router();

const passport = require('passport');
const connection = require('../config/database');
const Post = connection.models.Post;
const pag = require('../helpers/helpers').pagination;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('page/1');
});


router.get('/page/:page', async function (req, res, next) {
    console.log(req.config.posts.postsForPage)
    var currentPage = Math.max(0, req.params.page)
    allPosts = await Post.find({ online: true })
    postsInPage = allPosts.filter((post, index) => {
        let postN = index + 1;
        let max = currentPage * req.config.posts.postsForPage;
        let min = max - req.config.posts.postsForPage + 1;
        return (postN >= min && postN <= max);
    })

    var page = {
        general: req.config.general,
        categories: req.config.categories,
        postsInPage,
        pagination: pag(currentPage, allPosts.length, req.config.posts.postsForPage, 5) //currentPage, nElements, nElementForPage, nShowedPages
    };

    res.render('page', page);
});

router.get('/post/:id', async function (req, res, next) {
    var post = await Post.findOne({ _id: req.params.id })
    if (req.session.postViewed === null || req.session.postViewed === undefined) {
        req.session.postViewed = []
    }
    if (!req.session.postViewed.includes(req.params.id)) {
        req.session.postViewed.push(req.params.id)
        await Post.findOneAndUpdate({ _id: req.params.id }, { $inc: { visitsCount: 1 } });
    }

    var page = { general: req.config.general, categories: req.config.categories, post, }
    res.render('post', page);

});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/admin/posts' })); // autenticate chiama la verifyCallback in passport.js

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/login', (req, res, next) => {
    var page = { general: req.config.general, categories: req.config.categories, }
    res.render('login', page);

});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});
router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

module.exports = router;
