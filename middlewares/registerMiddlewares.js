const { insertValues, executeQuery } = require("../queries");
const db = require("../db");
const { tableNames, roles } = require("../config").constants;
const stringCreator = require("../queries/stringCreator");

const registerMiddleware = async (req, res, next) => {
  const role = roles.PUBLIC_ROLE;
  const tableName = tableNames.USERS;

  if (req.body) {
    if (
      req.body.username &&
      req.body.password &&
      req.body.first_name &&
      req.body.last_name &&
      req.body.email
    ) {
      const { columns, values, queryPrepared } = stringCreator.users(req.body);

      const added = await executeQuery(
        { db, tableName, role, columns, values, queryPrepared },
        insertValues
      );

      if (!added) return res.status(400).send("Duplicity found");

      return next();
    }
  }

  return res.status(400).send("Incomplete");
};

module.exports = { registerMiddleware };
