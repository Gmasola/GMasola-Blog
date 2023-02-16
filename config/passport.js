const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');
const User = connection.models.User;
const validPassword = require('../lib/passwordUtils').validPassword;

const customFields = { // valori inseriti nel form di login
    usernameField: 'uname',
    passwordField: 'pw'
};

const verifyCallback = (username, password, done) => {

    User.findOne({ username: username })
        .then((user) => {

            if (!user) { return done(null, false) }
            
            const isValid = validPassword(password, user.hash, user.salt);
            
            if (isValid) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch((err) => {   
            done(err);
        });

}

const strategy  = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {   //determines which data of the user object should be stored in the session. The result of the serializeUser method is attached to the session as req.session.passport.user = {}
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {   //https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
    User.findById(userId)  //forse è il valore del id della tabella user che viene riportato nella sessione
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});

