const {
  selectWithUsernameAndPassword,
  executeQuery,
  selectById,
} = require("../queries");
const db = require("../db");
const { tableNames, roles } = require("../config/index").constants;

const authCheck = async (username, password, done) => {
  console.log("username " + username);
  const role = roles.PUBLIC_ROLE;
  const tableName = tableNames.USERS;
  try {
    const user = await executeQuery(
      { db, tableName, role, username, password },
      selectWithUsernameAndPassword
    );

    if (user) return done(null, user);

    return done(null, false, { message: "Incorrect username or password" });
  } catch (error) {
    console.error(error);
    return done(error);
  }
};

const deserializedUserFinder = async (id, done) => {
  console.log("deserializing user", id);
  const role = roles.REGISTERED_ROLE;
  const tableName = tableNames.USERS;
  let user;
  let err;
  try {
    user = await executeQuery({ db, tableName, role, id }, selectById);
    delete user.password;
  } catch (error) {
    err = error;
  }

  done(err, user);
};

module.exports = { authCheck, deserializedUserFinder };
