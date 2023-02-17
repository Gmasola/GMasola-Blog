const mongoose = require('mongoose');

require('dotenv').config()

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 * 
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 */ 

const conn = process.env.DB_STRING;

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String
});

const postSchema = new mongoose.Schema({
    
    title: String,
    text: String,
    data: String,
    category: String,
    author:String,
    online:Boolean,
    visitsCount:Number
});

  const configSchema = new mongoose.Schema({
    general:{
        title: String,
        logo: String,
        description: String
    },
    posts:{
      postsForPage : Number
    },
    categories: Array
  });

  const visitSchema = new mongoose.Schema({
    session: String,
    post: String
  });


const Config = connection.model('Config', configSchema);
const User = connection.model('User', UserSchema);
const Post = connection.model('Post', postSchema);
const Visit = connection.model('Visit', visitSchema)


// Expose the connection
module.exports = connection;


