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
 *          - field
 *          - value
 *        properties:
 *          product_id:
 *              type: integer
 *              description: The id of a product
 *          value:
 *              type: integer
 *              description: The new quantity to be inserted
 *          field:
 *              type: string
 *              description: The 'quantity'
 */

/**
 * @swagger
 * tags:
 *  name: Cart
 *  description: Api to your cart
 */

/**
 * @swagger
 * users/{id}/cart:
 *  get:
 *    summary: Sends back an array of cart items
 *    tags: [Cart]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
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
 * users/{id}/cart:
 *  post:
 *    summary: Adds a new item to the cart
 *    tags: [Cart]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Cart_item'
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
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
 * users/{id}/cart:
 *  put:
 *    summary: Updates a quantity of a product in the cart
 *    tags: [Cart]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Update_cart'
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *
 *    responses:
 *      200:
 *        description: Updated
 *      400:
 *        description: Cannot be updated
 */

/**
 * @swagger
 * users/{id}/cart:
 *  delete:
 *    summary: Deletes a product from the cart
 *    tags: [Cart]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Delete_by_product_id'
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
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

// Checkout endpoint
router.use("/checkout", checkoutRouter);

router.get("/", loginVerification, userIdVerification, getCartByUserMiddleware);

router.post("/", loginVerification, userIdVerification, postCartMiddleware);

router.put("/", loginVerification, userIdVerification, putCartMiddleware);

router.delete("/", loginVerification, userIdVerification, deleteCartMiddleware);

module.exports = router;
