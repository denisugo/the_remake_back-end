/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - username
 *          - password
 *          - first_name
 *          - last_name
 *          - email
 *        properties:
 *          id:
 *            type: integer
 *            description: The user's ID
 *          username:
 *            type: string
 *            description: The user's username
 *          password:
 *            type: string
 *            description: The user's password
 *          first_name:
 *            type: string
 *            description: The user's first_name
 *          last_name:
 *            type: string
 *            description: The user's last_name
 *          email:
 *            type: string
 *            description: The user's email
 *          is_admin:
 *            type: string
 *            description: Indicates whether the user is an admin or not
 */

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: Api to your user's details
 */

/**
 * @swagger
 * users/:
 *  get:
 *    summary: allows you to get user's details
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *
 *    responses:
 *      200:
 *        description: Your detail has been sent
 */

/**
 * @swagger
 * users/{id}/logout:
 *  get:
 *    summary: allows you to log user out
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: You have been logged out
 */

/**
 * @swagger
 * users/{id}:
 *  put:
 *    summary: allows you to change user's details
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Update'
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *
 *    responses:
 *      200:
 *        description: Your detail has been updated
 *      400:
 *        description: Cannot be updated
 */
const express = require("express");
const router = express.Router();
const {
  loginVerification,
  userIdVerification,
  isAdminVerification,
} = require("../middlewares/loginMiddlewares");

const {
  deleteUserMiddleware,
  updateUserMiddleware,
  getUserMiddleware,
} = require("../middlewares/userMiddlewares");

const ordersRouter = require("./orders");
const cartRouter = require("./cart");
// orders endpoint
router.use("/:id/orders", ordersRouter);
// cart endpoint
router.use("/:id/cart", cartRouter);

/* GET user profile. */
// router.get("/:id", loginVerification, userIdVerification, getUserMiddleware);
router.get("/", loginVerification, getUserMiddleware);

/* Logout user. */
router.get("/:id/logout", (req, res) => {
  console.log("logging out");
  req.logout();
  res.clearCookie("connect.sid").send("Logged out");
});

/* PUT user profile. */
router.put("/:id", loginVerification, userIdVerification, updateUserMiddleware);

/* DELETE user profile. */
/* Only admins can delete a user */
router.delete(
  "/:id",
  loginVerification,
  userIdVerification,
  isAdminVerification,
  deleteUserMiddleware
);

module.exports = router;
