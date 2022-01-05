/**
 * @swagger
 *  components:
 *    schemas:
 *      Credentials:
 *        type: object
 *        required:
 *          - username
 *          - password
 *        properties:
 *          username:
 *            type: string
 *            description: The user's username.
 *          password:
 *            type: string
 *            description: The user's password.
 *      User_response:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *            description: The user's ID
 *          username:
 *            type: string
 *            description: The user's username
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
 *
 */

/**
 * @swagger
 * tags:
 *  name: Login
 *  description: Api to your user's logins
 */

/**
 * @swagger
 * /login:
 *  post:
 *    summary: Logs a user in
 *    tags: [Login]
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/Credentials'
 *
 *    responses:
 *      200:
 *        description: Successfully logged in
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User_response'
 *      400:
 *        description: Bad request when some data is missing
 *      401:
 *        description: Unauthorized when provided data is incorrect
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");

/* GET login page. */
router.get("/", (req, res, next) => {
  res.send("login will be here soon");
});

router.post(
  "/",
  (req, res, next) => {
    console.log(req.body);
    next();
  },
  passport.authenticate("local", { session: true }),
  (req, res, next) => {
    res.send(req.user);
  }
);

module.exports = router;
