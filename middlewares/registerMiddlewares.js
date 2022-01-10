const { insertValues, executeQuery } = require("../queries");
const db = require("../db");
const { tableNames, roles } = require("../config").constants;
const stringCreator = require("../queries/stringCreator");

const registerMiddleware = async (req, res, next) => {
  const tableName = tableNames.USERS;
  //? Should only proceed if all user parameters were supplied
  if (req.body) {
    if (
      req.body.username &&
      req.body.password &&
      req.body.first_name &&
      req.body.last_name &&
      req.body.email
    ) {
      //? Generate colums, values to insert and placeholders(queryPrepared)
      //? So it has the format of INSERT INTO(column1,column2...) VALUES($1, $2...) and values are mapped within an array
      const { columns, values, queryPrepared } = stringCreator.users(req.body);

      const queryCommand = `INSERT INTO ${tableNames.USERS}(${columns}) VALUES(${queryPrepared}) RETURNING *;`;

      try {
        //? Retrieve the newly created user
        const { rows } = await db.query(queryCommand, values);

        if (rows[0]) {
          //res.status(201).send(rows[0]);
          return next();
        }
      } catch (error) {
        //? Usernames should be unique, so if this rule is violated, a specific error message should be sent
        if (/user_username_key/.exec(error.message))
          return res
            .status(400)
            .send({ message: "This username is probably already in use" });
      }
    }
  }

  return res.status(400).send("Incomplete");
};

module.exports = { registerMiddleware };
