const {
  selectWithUsernameAndPassword,
  executeQuery,
  selectById,
} = require("../queries");
const db = require("../db");
const { tableNames, roles } = require("../config/index").constants;

const authCheck = async (username, password, done) => {
  console.log("username " + username);

  //? username and password should be passed as array because users can modify them.
  try {
    const { rows } = await db.query(
      `SELECT * FROM ${tableNames.USERS} WHERE username = $1 AND password = $2;`,
      [username, password]
    );
    //? If rows[0] is not undefined, a user is found
    if (rows[0]) return done(null, rows[0]);

    return done(null, false, { message: "Incorrect username or password" });
  } catch (error) {
    console.error(error.message);
    return done(error);
  }
};

const deserializedUserFinder = async (id, done) => {
  console.log("deserializing user", id);
  let user;
  let err;
  //? Id should be passed as array because users can modify it.
  //? Id is stored in cookies
  try {
    user = (
      await db.query(`SELECT * FROM ${tableNames.USERS} WHERE id = $1;`, [id])
    ).rows[0];
  } catch (error) {
    err = error;
  }

  done(err, user);
};

module.exports = { authCheck, deserializedUserFinder };
