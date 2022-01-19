const db = require("../db");
const { tableNames } = require("../config/index").constants;
const stringCreator = require("../queries/stringCreator");

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
const authCheckFacebook = async (accessToken, refreshToken, profile, done) => {
  //? Profile contains id, first_name, last_name under _json object
  const user = profile._json;

  if (!user.id) return done(null, false, { message: "Something went wrong" });

  //? id only has 15 characters
  const username = `${user.id}facebook`;
  //? the password could be made of a hashed combination of the id, username, last name and first name
  //? But for this project simple word 'facebookSecret' is used
  const password = "facebookSecret";

  console.log("username " + username);

  //* Check if user exists, if not, should create a new record
  //? username and password should be passed as array because users can modify them.
  try {
    const existingUser = (
      await db.query(
        `SELECT * FROM ${tableNames.USERS} WHERE username = $1 AND password = $2;`,
        [username, password]
      )
    ).rows[0];

    //? If existingUser is not undefined, a user is found
    if (existingUser) return done(null, existingUser);

    //* Register a user
    //? Generate colums, values to insert and placeholders(queryPrepared)
    //? So it has the format of INSERT INTO(column1,column2...) VALUES($1, $2...) and values are mapped within an array
    const { columns, values, queryPrepared } = stringCreator.users({
      username,
      password,
      email: "replacethisemail@example.com",
      first_name: user.first_name,
      last_name: user.last_name,
    });

    const newUser = (
      await db.query(
        `INSERT INTO ${tableNames.USERS}(${columns}) VALUES(${queryPrepared}) RETURNING *;`,
        values
      )
    ).rows[0];

    //? If newUser is not undefined, a user has been created
    if (newUser) return done(null, newUser);
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

module.exports = { authCheck, authCheckFacebook, deserializedUserFinder };
