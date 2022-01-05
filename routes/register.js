/**
 * @swagger
 * tags:
 *  name: Registration
 *  description: Api to your user's registration
 */

/**
 * @swagger
 * /register:
 *  post:
 *    summary: Register a user
 *    tags: [Registration]
 *    requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *
 *    responses:
 *      200:
 *        description: Successfully registered
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User_response'
 *      401:
 *        description: Unauthorized
 */

const express = require("express");
const passport = require("passport");
const { registerMiddleware } = require("../middlewares/registerMiddlewares");
const router = express.Router();

// Flow: pasport deserialize(unsuccess)->register middlewere->passport auth(generates cookies)
router.post(
  "/",
  registerMiddleware,
  passport.authenticate("local", { session: true }),
  (req, res, next) => {
    res.send(req.user);
  }
);

module.exports = router;
