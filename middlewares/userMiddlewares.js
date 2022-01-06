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
  //? No need to check if id exists, it should be already checked!
  const id = req.user.id;

  //? Should only proceed when body is supplied
  if (req.body) {
    //? These two props should be checked here
    //? Should only proceed if both field and value were supplied
    const newValue = req.body.value;
    const columnName = req.body.field;
    if (newValue && columnName) {
      try {
        //? Id and newValue should be passed as an array because user can manually change them
        //? Rows is always an array, so the first valuu only should be taken
        const { rows } = await db.query(
          `UPDATE ${tableNames.USERS} SET ${columnName} = $1 WHERE id = $2 RETURNING *;`,
          [newValue, id]
        );
        if (rows[0]) return res.send("Updated");
      } catch (error) {
        //? Usernames should be unique, so if this rule is violated, a specific error message should be sent
        if (/user_username_key/.exec(error.message))
          return res
            .status(400)
            .send("This username is probably already in use");
      }
    }
  }
  return res.status(400).send("Cannot be updated");
};

// const deleteUserMiddleware = async (req, res, next) => {
//   const role = roles.ADMIN_ROLE;

//   if (req.body) {
//     const id = req.body.id;
//     if (id) {
//       const deleted = await executeQuery(
//         { db, tableName, role, id },
//         deleteValuesById
//       );
//       if (deleted) return res.status(204).send("Successfully deleted");
//     }
//   }

//   return res.status(400).send("The operation cannot be done");
// };

module.exports = {
  updateUserMiddleware,
  // deleteUserMiddleware,
  getUserMiddleware,
};
