var express = require('express');
var router = express.Router();

const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
const Config = connection.models.Config;
const Post = connection.models.Post;
const Visit = connection.models.Visit;
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;
const pag = require('../helpers/helpers').pagination;

/* GET home page. */
router.get('/',  function (req, res, next) {
    res.redirect('page/1');
});


router.get('/page/:page', async function (req, res, next) {
    var currentPage = Math.max(0, req.params.page)
    var general =  res.locals.config.general
    var categories = res.locals.config.categories
    var postForPage = res.locals.config.posts.postsForPage 
    var posts = await Post.find({online:true})
    //console.log(posts)
    var nPosts = posts.length
    var postsInPage= posts.filter((post, index) =>{
        let postN = index +1
        let max = currentPage * postForPage 
        let min = max - postForPage + 1
      //  console.log(postN, min, max, postN>=min , postN <= max)

        return (postN>=min && postN <= max)
    })

    var pagination= pag(currentPage, nPosts, postForPage, 5)  //currentPage, nElements, nElementForPage, nShowedPages
    var page = {general, categories, postsInPage, pagination} //  Destructuring assignment
   //res.send(page)
   res.render('page', page);
});

router.get('/post/:id',  async function (req, res, next) {
    var general =  res.locals.config.general
    var categories = res.locals.config.categories
    
    var post =  await Post.findOne({_id: req.params.id}) 
    if (req.session.postViewed === null ||req.session.postViewed === undefined ){
        req.session.postViewed = []
    }
   if (!req.session.postViewed.includes(req.params.id) ){
        req.session.postViewed.push(req.params.id) 
       await Post.findOneAndUpdate({ _id: req.params.id }, { $inc:{visitsCount: 1 }       });
    }
 
    
    var page = {general, categories, post, } //  Destructuring assignment
   //res.send(page)
   
   res.render('post', page);

});


/**
 * -------------- POST ROUTES ----------------
 */

router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/login-success' })); // autenticate chiama la verifyCallback in passport.js

router.post('/register', (req, res, next) => {
    console.log(req)
    const saltHash = genPassword(req.body.pw);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
        username: req.body.uname,
        hash: hash,
        salt: salt,
        admin: true
    });

    newUser.save()
        .then((user) => {
            console.log(user);
        });

    res.redirect('/login');
});

/**
* -------------- GET ROUTES ----------------
*/



// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/login', (req, res, next) => {

    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="uname">\
    <br>Enter Password:<br><input type="password" name="pw">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/register', (req, res, next) => {

    const form = '<h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="uname">\
                    <br>Enter Password:<br><input type="password" name="pw">\
                    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});

/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 * 
 * Also, look up what behaviour express session has without a maxage set
 */
router.get('/protected-route', (req, res, next) => {

    // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
    if (req.isAuthenticated()) {
        res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
    } else {
        res.send('<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>');
    }
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/protected-route');
});

router.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

module.exports = router;
