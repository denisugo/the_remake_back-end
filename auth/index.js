const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const {
  authCheck,
  deserializedUserFinder,
  authCheckFacebook,
} = require("./config");
require("dotenv").config();

//? The function below will authenticate user by a username and password
passport.use(new LocalStrategy(authCheck));

//? The function below will authenticate user via Facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.OAUTH2_FACEBOOK_APP_ID,
      clientSecret: process.env.OAUTH2_FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:4000/api/v1/login/facebook",
      profileFields: ["id", "first_name", "last_name", "email"],
    },
    authCheckFacebook
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(deserializedUserFinder);
