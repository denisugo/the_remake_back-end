/**
 * @swagger
 *  components:
 *    schemas:
 *
 *      Order:
 *        type: object
 *        properties:
 *          product_id:
 *              type: integer
 *              description: The id of a product
 *          quantity:
 *              type: integer
 *              description: The quantity of a product
 *          name:
 *              type: string
 *              description: The name of an order item
 *
 *      Update_order:
 *        type: object
 *        required:
 *          - field
 *          - value
 *          - id
 *          - product_id
 *        properties:
 *          id:
 *              type: integer
 *              description: The id of an order
 *          product_id:
 *              type: integer
 *              description: The id of a product
 *          value:
 *              type: integer
 *              description: The new quantity to be inserted
 *          field:
 *              type: string
 *              description: The 'quantity'
 *
 *      Delete_by_order_id:
 *        type: object
 *        required:
 *          - order_id
 *        properties:
 *          order_id:
 *              type: integer
 *              description: The id of an order
 *
 *      Orders:
 *        type: object
 *        properties:
 *          order_id:
 *            type: object
 *            properties:
 *              shipped:
 *                type: boolean
 *                description: Order shipment status
 *              products:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Order'
 *
 */

/**
 * @swagger
 * tags:
 *  name: Orders
 *  description: Api to your products
 */

/**
 * @swagger
 * users/orders:
 *  get:
 *    summary: Sends back an array of orders
 *    tags: [Orders]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *
 *    responses:
 *      200:
 *        description: Orders object sent. if user is not signed in, user response will be undefined
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Orders'
 *
 */

/**
 * @swagger
 * users/orders:
 *  post:
 *    summary: Adds a new order
 *    tags: [Orders]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Checkout'
 *
 *    responses:
 *      201:
 *        description: Your order has been placed
 *      400:
 *        description: Check your cart
 */

/**
 * @swagger
 * users/orders:
 *  put:
 *    summary: Updates a quantity of an order
 *    tags: [Orders]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Update_order'
 *    responses:
 *      200:
 *        description: Updated
 *      400:
 *        description: Cannot be updated
 */

const express = require("express");

const {
  loginVerification,
  isAdminVerification,
} = require("../middlewares/loginMiddlewares");

const {
  getOrdersByUserMiddleware,
  // putOrderMiddleware,
  // deleteOrderMiddleware,
  postOrderMiddleware,
} = require("../middlewares/orderMiddlewares");

const router = express.Router({ mergeParams: true });

//* GET orders.
router.get("/", loginVerification, getOrdersByUserMiddleware);

// //* PUT orders.
// router.put(
//   "/",
//   loginVerification,
//   isAdminVerification,
//   putOrderMiddleware
// );

//* POST orders.
router.post("/", loginVerification, isAdminVerification, postOrderMiddleware);

/* DELETE orders. */
// router.delete(
//   "/",
//   loginVerification,
//   userIdVerification,
//   isAdminVerification,
//   deleteOrderMiddleware
// );

module.exports = router;
