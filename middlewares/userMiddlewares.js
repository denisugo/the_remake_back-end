const {
  updateValuesById,
  deleteValuesById,
  executeQuery,
} = require("../queries");
const db = require("../db");
const { tableNames, roles } = require("../config").constants;

//setup
const tableName = tableNames.USERS;

/**
 * Returns the user, but the password is excluded
 */
const getUserMiddleware = (req, res, next) => {
  res.send(req.user);
};

const updateUserMiddleware = async (req, res, next) => {
  const role = roles.REGISTERED_ROLE;
  //No need to check if id exists, it should nbe already checked!
  const id = req.user.id;

  // These two props should be checked here
  const newValue = req.body.value;
  const columnName = req.body.field;

  if (req.body) {
    if (newValue && columnName) {
      const updated = await executeQuery(
        { db, tableName, role, id, newValue, columnName },
        updateValuesById
      );
      if (updated) return res.status(200).send("Updated"); //status is set manually for testing purposes

      if (!updated && columnName === "username")
        return res.status(400).send("This username is probably already in use");
    }
  }
  return res.status(400).send("Cannot be updated");
};

const deleteUserMiddleware = async (req, res, next) => {
  const role = roles.ADMIN_ROLE;

  if (req.body) {
    const id = req.body.id;
    if (id) {
      const deleted = await executeQuery(
        { db, tableName, role, id },
        deleteValuesById
      );
      if (deleted) return res.status(204).send("Successfully deleted");
    }
  }

  return res.status(400).send("The operation cannot be done");
};

module.exports = {
  updateUserMiddleware,
  deleteUserMiddleware,
  getUserMiddleware,
};
