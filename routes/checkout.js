// FLOW: from cart attempt to place an order -> attempt to pay at checkout -> post an order with transaction id

/**
 * @swagger
 *  components:
 *    schemas:
 *      Checkout:
 *        type: object
 *        required:
 *          - cart
 *          - transaction_id
 *        properties:
 *          cart:
 *            type: array
 *            description: Items from a carts
 *            items:
 *              $ref: '#/components/schemas/Cart_item'
 *          transaction_id:
 *            type: integer
 *            description: The id of a transaction
 */

/**
 * @swagger
 * tags:
 *  name: Checkout
 *  description: Api to your checkout
 */

/**
 * @swagger
 * users/{id}/cart/checkout:
 *  post:
 *    summary: Checkout the provided cart
 *    tags: [Checkout]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Cart_items'
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *
 *    responses:
 *      307:
 *        description: Redirecting to post order
 *      400:
 *        description: Check your cart
 */

const express = require("express");
const {
  postCheckoutMiddleware,
} = require("../middlewares/checkoutMiddlewares");

const {
  loginVerification,
  userIdVerification,
} = require("../middlewares/loginMiddlewares");

const router = express.Router({ mergeParams: true });

// POST checkout
router.post("/", loginVerification, userIdVerification, postCheckoutMiddleware);

module.exports = router;
