var express = require('express');
var router = express.Router();


const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
const Config = connection.models.Config;
const Post = connection.models.Post;
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;
const pag = require('../helpers/helpers').pagination;


/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/login');
});

//POSTS
router.get('/posts', async function (req, res, next) {

    var posts = await Post.find({})
    var general = res.locals.config.general
    var categories = res.locals.config.categories
    var page = { general, categories, posts, } //  Destructuring assignment
    //res.send(page)

    res.render('admin/posts', page);

});

router.get('/posts/new', async function (req, res, next) {
    var page = res.locals.config
    res.render('admin/newPost', page);

});

router.get('/posts/edit/:id', async function (req, res, next) {
    var general = res.locals.config.general
    var categories = res.locals.config.categories
    var post = await Post.findOne({ _id: req.params.id })
    var page = { general, categories, post, }
    res.render('admin/editPost', page);

});

router.get('/posts/delete/:id', async (req, res, next) => {
    var post = req.params.id
    await Post.deleteOne({ _id: post })

    res.redirect('/admin/posts/');
});

router.get('/posts/disable/:id', async (req, res, next) => {
    await Post.findOneAndUpdate({ _id: req.params.id }, { $set:{
       online: false
    }
    });

    res.redirect('/admin/posts/');
});

router.post('/posts/new', async (req, res, next) => {

    await Post.create({

        title: req.body.title,
        text: req.body.body,
        data: (new Date()).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        author: "tizio",
        online: true
    });
    res.redirect('/admin/posts');
});



router.post('/posts/edit/:id', async (req, res, next) => {
    if(req.body.online === "Published"){
        var online = true
    }
    else{
        var online = false
    }
    let timestamp = new Date();
let formattedDate = timestamp.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });

    await Post.findOneAndUpdate({ _id: req.params.id }, {
        title: req.body.title,
        text: req.body.body,
        category:req.body.category,
        data: (new Date()).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        author: "tizio",
        online: online,
    });
    res.redirect('/admin/posts/');
});






//SETTING SECTION

router.get('/settings', async function (req, res, next) {
    res.render('admin/settings', res.locals.config);
});

router.get('/comments', async function (req, res, next) { });



router.post('/settings', async (req, res, next) => {
  
    let logoFile;
    let uploadPath;
    console.log(req.files)
    logoFile = req.files.logo;
    uploadPath = 'C:/Users/gmaso/OneDrive/Desktop/INFORMATICA/_PROGETTI/Simple blog/app/public/images/' + logoFile.name;

    logoFile.mv(uploadPath, function(err) {
        if (err)
          return res.status(500).send(err);
          });
    await Config.findOneAndUpdate({ _id: "616076ebc5f0079ec87453b1" }, {
        
        general: {
            title: req.body.title,
            logo: "/images/logo.png",
            description: req.body.description
        },
        posts: {
            postsForPage: req.body.PostForPage
        },
        categories: req.body.categories
    });

    res.redirect('/admin/settings');
});



router.post('/admin/settings/addCategory', async (req, res, next) => {
    Config.findOneAndUpdate({}, { $push:{ categories: req.body.add}})
    

    res.redirect('/admin/settings');
});
//USERS

router.get('/users', async function (req, res, next) {
    var users = await User.find({})
    var general = res.locals.config.general
    var categories = res.locals.config.categories
    var page = { general, categories, users, } //  Destructuring assignment
    //res.send(page)

    res.render('admin/users', page);

});



module.exports = router;