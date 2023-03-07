var express = require('express');
var router = express.Router();

const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
const Config = connection.models.Config;
const Post = connection.models.Post;
const pag = require('../helpers/helpers').pagination;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/admin/posts');
});


router.get('/posts', async function (req, res, next) {

    var posts = await Post.find({})
    var page = { general: req.config.general, categories: req.config.categories, posts, } //  Destructuring assignment
    res.render('admin/posts', page);

});

router.get('/posts/new', async function (req, res, next) {
    var page = { general: req.config.general, categories: req.config.categories}
    res.render('admin/newPost', page);

});

router.get('/posts/edit/:id', async function (req, res, next) {
      var post = await Post.findOne({ _id: req.params.id })
    var page = {  general: req.config.general, categories: req.config.categories, post, }
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




//POSTS
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
    res.render('admin/settings', { general: req.config.general, categories: req.config.categories});
});

router.post('/settings', async (req, res, next) => {
  
    await Config.findOneAndUpdate({ _id: "616076ebc5f0079ec87453b1" }, {
        
        general: {
            title: req.body.title,
            description: req.body.description
        },
        posts: {
            postsForPage: req.body.PostForPage
        },
        categories: req.body.categories
    });

    res.redirect('/admin/settings');
});



//router.post('/admin/settings/addCategory', async (req, res, next) => {
  //  Config.findOneAndUpdate({}, { $push:{ categories: req.body.add}})
    // res.redirect('/admin/settings');
//});
//USERS

router.get('/users', async function (req, res, next) {
    var users = await User.find({})
    var page = { general: req.config.general, categories: req.config.categories, users, } //  Destructuring assignment
    //res.send(page)

    res.render('admin/users', page);

});

router.post('/newuser', (req, res, next) => {
    console.log(req)
    const saltHash = genPassword(req.body.pw);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
        username: req.body.uname,
        hash: hash,
        salt: salt,
        email:req.body.email,
        userType: req.body.userType
    });

    newUser.save()
        .then((user) => {
            console.log(user);
        });

    res.redirect('/login');
});

module.exports = router;