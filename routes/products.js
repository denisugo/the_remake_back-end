/**
 * @swagger
 *  components:
 *    schemas:
 *      Product:
 *        type: object
 *        required:
 *          - name
 *          - description
 *          - price
 *          - category
 *          - preview
 *        properties:
 *          id:
 *            type: integer
 *            description: The product's ID
 *          name:
 *            type: string
 *            description: The products's name
 *          description:
 *            type: string
 *            description: The products's description
 *          price:
 *            type: integer
 *            description: The products's price
 *          category:
 *            type: string
 *            description: The products's category
 *          preview:
 *            type: string
 *            description: The products's preview
 *      Products:
 *        type: array
 *        items:
 *          $ref: '#/components/schemas/Product'
 * 
 *      Update:
 *        type: object
 *        required:
 *          - field
 *          - value
 *        properties:
 *          field:
 *            type: string
 *            description: The field to be updated
 *          value:
 *            type: string
 *            description: The value to be passed in
 * 
 *      Delete_by_id:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          id:
 *            type: integer
 *            description: The id of content to be updated
 
 
 */

/**
 * @swagger
 * tags:
 *  name: Products
 *  description: Api to your products
 */
/**
 * @swagger
 * tags:
 *  name: Product
 *  description: Api to your product
 */

/**
 * @swagger
 * /products:
 *  get:
 *    summary: Sends back an array of all products filtered by category
 *    tags: [Products]
 *    parameters:
 *      - in: query
 *        name: category
 *        schema:
 *          type: string
 *
 *    responses:
 *      200:
 *        description: If category is invalid, sends back all products. If user is not signed in, user response will be undefined
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                products:
 *                  $ref: '#/components/schemas/Products'
 *                user:
 *                  $ref: '#/components/schemas/User_response'
 */

/**
 * @swagger
 * /products:
 *  post:
 *    summary: Allows you to add a new product (provided id will be ignored)
 *    tags: [Products]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Product'
 *
 *    responses:
 *      200:
 *        description: Successfully added
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Products'
 *      401:
 *        description: Unauthorized
 */

/**
 * @swagger
 * /products/{id}:
 *  get:
 *    summary: Sends back an object of a product
 *    tags: [Product]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *
 *    responses:
 *      200:
 *        description: Product object sent
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /products/{id}:
 *  put:
 *    summary: Allows you to update a product
 *    tags: [Product]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Update'
 *
 *    responses:
 *      200:
 *        description: Successfully updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      401:
 *        description: Unauthorized
 */

/**
 * @swagger
 * /products/{id}:
 *  delete:
 *    summary: Allows you to delete a product
 *    tags: [Product]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Delete_by_id'
 *
 *    responses:
 *      204:
 *        description: Successfully deleted
 *      401:
 *        description: Unauthorized
 */

const express = require("express");
const {
  loginVerification,
  isAdminVerification,
} = require("../middlewares/loginMiddlewares");
const {
  getProductsByCategoryMiddleware,
  getProductByIdMiddleware,
  postProductMiddleware,
  putProductMiddleware,
  deleteProductMiddleware,
} = require("../middlewares/productMiddlewares");

const router = express.Router();

/* GET products page. */
router.get("/", getProductsByCategoryMiddleware);

/* GET product page. */
router.get("/:id", getProductByIdMiddleware);

/* POST products page. */
router.post("/", loginVerification, isAdminVerification, postProductMiddleware);

/* PUT product page. */
router.put(
  "/:id",
  loginVerification,
  isAdminVerification,
  putProductMiddleware
);

/* DELETE product page. */
router.delete(
  "/:id",
  loginVerification,
  isAdminVerification,
  deleteProductMiddleware
);

module.exports = router;
