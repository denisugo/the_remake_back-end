/**
 * @swagger
 *  components:
 *    schemas:
 *      Cart_item:
 *        type: object
 *        required:
 *          - product_id
 *          - quantity
 *        properties:
 *          user_id:
 *            type: integer
 *            description: The id of a user
 *          product_id:
 *            type: integer
 *            description: The id of a product
 *          quantity:
 *            type: integer
 *            description: The quantity of a product
 *
 *      Cart_items:
 *        type: array
 *        items:
 *          $ref: '#/components/schemas/Cart_item'
 *
 *      Delete_by_product_id:
 *        type: object
 *        required:
 *          - product_id
 *        properties:
 *          product_id:
 *              type: integer
 *              description: The id of a product
 *
 *      Update_cart:
 *        type: object
 *        required:
 *          - product_id
 *          - value
 *        properties:
 *          product_id:
 *              type: integer
 *              description: The id of a product
 *          value:
 *              type: integer
 *              description: The new quantity to be inserted
 */

/**
 * @swagger
 * tags:
 *  name: Cart
 *  description: Api to your cart
 */

/**
 * @swagger
 * users/cart:
 *  get:
 *    summary: Sends back an array of cart items
 *    tags: [Cart]
 *
 *    responses:
 *      200:
 *        description: Orders object sent. If user is not signed in, user response will be undefined
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Cart_items'
 *      500:
 *        description: An error occured
 */

/**
 * @swagger
 * users/cart:
 *  post:
 *    summary: Adds a new item to the cart
 *    tags: [Cart]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Cart_item'
 *
 *    responses:
 *      201:
 *        description: Added to the cart
 *      400:
 *        description: Check your cart
 *
 */

/**
 * @swagger
 * users/cart:
 *  put:
 *    summary: Updates a quantity of a product in the cart
 *    tags: [Cart]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Update_cart'
 *
 *    responses:
 *      200:
 *        description: Updated
 *      400:
 *        description: Cannot be updated
 */

/**
 * @swagger
 * users/cart:
 *  delete:
 *    summary: Deletes a product from the cart
 *    tags: [Cart]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Delete_by_product_id'
 *
 *    responses:
 *      204:
 *        description: Successfully deleted
 *      400:
 *        description: The operation cannot be done
 */
const express = require("express");
const {
  getCartByUserMiddleware,
  postCartMiddleware,
  putCartMiddleware,
  deleteCartMiddleware,
} = require("../middlewares/cartMiddlewares");

const {
  loginVerification,
  userIdVerification,
} = require("../middlewares/loginMiddlewares");

const router = express.Router({ mergeParams: true });

const checkoutRouter = require("./checkout");

//* Checkout endpoint
router.use("/checkout", checkoutRouter);

//* GET cart
router.get("/", loginVerification, getCartByUserMiddleware);

//* POST cart
router.post("/", loginVerification, postCartMiddleware);

//* PUT cart
router.put("/", loginVerification, putCartMiddleware);

//* DELETE cart
router.delete("/", loginVerification, deleteCartMiddleware);

module.exports = router;
