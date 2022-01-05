const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const { authCheck, deserializedUserFinder } = require("./config");

passport.use(new LocalStrategy(authCheck));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(deserializedUserFinder);
