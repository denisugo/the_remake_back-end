const { executeQuery } = require("../queries");

/**
 * This function wiil check if user is already logged in
 */
const loginVerification = (req, res, next) => {
  try {
    if (req.user) return next();
  } catch (error) {
    console.error(error);
  }
  res.status(401).clearCookie("connect.sid").send("Unauthorized");
};

/**
 * This function wiil check if user id is correct
 */
const userIdVerification = (req, res, next) => {
  try {
    if (req.user.id === parseInt(req.params.id)) return next();
  } catch (error) {
    console.error(error);
  }

  res.status(401).send("Unauthorized");
};

const isAdminVerification = (req, res, next) => {
  console.log("is admin", req.user.is_admin);
  if (req.user.is_admin) return next();
  return res.status(401).send("Unauthorized");
};

module.exports = { loginVerification, userIdVerification, isAdminVerification };
