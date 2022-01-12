const { assert } = require("chai");
const db = require("../../db");
const { tableNames, roles } = require("../../config").constants;

const {
  getCartByUserMiddleware,
  postCartMiddleware,
  putCartMiddleware,
  deleteCartMiddleware,
} = require("../../middlewares/cartMiddlewares");

describe("Cart middlewares", () => {
  //? Mocking next function
  const next = () => {
    nextUsed = true;
  };

  //? Mocking res function
  //? Now it can mock .send, .status, .clearCookies
  const res = {
    status: (code) => {
      return {
        clearCookie: () => {
          return {
            send: (message) => {
              sendUsed = `${code} ${message}`;
            },
          };
        },
        send: (message) => {
          sendUsed = `${code} ${message}`;
        },
      };
    },
    send: (smth) => (sendUsed = smth),
  };

  //? If some of the functions was used, then send used is set to the returned value
  //? sendUsed can only be set to true or false
  let nextUsed;
  let sendUsed;

  beforeEach(() => {
    nextUsed = false;
    sendUsed = false;
  });

  describe("getCartByUserMiddleware", () => {
    it("Should send back an array", async () => {
      //* Mock req object
      //? A user with an id value of 3 is never deleted
      //? And he has references in each table
      const req = {
        user: { id: 3 },
      };

      //* Execute middleware function
      await getCartByUserMiddleware(req, res, next);

      assert.isArray(sendUsed);
      assert.isObject(sendUsed[0]);
      assert.strictEqual(nextUsed, false);
    });
    it("Should send back an empty array when id is incorrect", async () => {
      //* Mock req object
      const req = {
        user: { id: 90 }, //! 90 is wrong id
      };

      //* Execute middleware function
      await getCartByUserMiddleware(req, res, next);

      assert.isArray(sendUsed);
      assert.isUndefined(sendUsed[0]);
      assert.strictEqual(nextUsed, false);
    });
  });

  describe("postCartMiddleware", () => {
    //* Setup user id
    //? This id does not present in carts table
    const user_id = 1;

    afterEach(async () => {
      //? Delete the newly created record in the db
      const queryCommand = `DELETE FROM ${tableNames.CARTS} WHERE user_id = ${user_id};`;
      await db.query(queryCommand);
    });

    it("Should post a new cart item", async () => {
      //* Mock req object
      const req = {
        user: { id: user_id },
        body: {
          product_id: 3,
          quantity: 5,
        },
      };

      //* Execute middleware function
      await postCartMiddleware(req, res, next);

      assert.strictEqual(sendUsed, "201 Added to the cart");
      assert.strictEqual(nextUsed, false);
    });
    it("Should not post if the body hasnt some item", async () => {
      //* Mock req object
      const req = {
        user: { id: user_id },
        body: {
          product_id: 3,
          quantity: undefined, //! wrong quantity
        },
      };

      //* Execute middleware function
      await postCartMiddleware(req, res, next);

      assert.strictEqual(sendUsed, "400 Check your cart");
      assert.strictEqual(nextUsed, false);
    });

    it("Should not post if the body violates constrains", async () => {
      //* Mock req object
      const req = {
        user: { id: user_id },
        body: {
          product_id: 30, //!wrong product id
          quantity: 1,
        },
      };

      //* Execute middleware function
      await postCartMiddleware(req, res, next);

      assert.strictEqual(sendUsed, "400 Check your cart");
      assert.strictEqual(nextUsed, false);
    });
  });

  describe("putCartMiddleware", () => {
    //* Setup user_id and product_id
    //? Both of them permanently present in  the database
    const user_id = 3;
    const product_id = 3;

    let selected;

    beforeEach(async () => {
      //? Retrieve the object of the cart
      //? This will be used for resetting of the product in afterEach
      selected = (
        await db.query(
          `SELECT * FROM ${tableNames.CARTS} WHERE user_id = ${user_id} AND product_id = ${product_id};`
        )
      ).rows[0];
    });

    afterEach(async () => {
      //? Reset recently updated cart
      //? Execute update that will reset the database to its original values
      const queryCommand = `UPDATE ${tableNames.CARTS} SET (user_id, product_id, quantity) = (${selected.user_id}, ${selected.product_id}, ${selected.quantity}) WHERE user_id = ${user_id} AND product_id = ${product_id};`;
      await db.query(queryCommand);
    });

    it("Should update a quantity", async () => {
      //* Setup new quality
      const newQuantity = 10;
      //* Mock req object
      const req = {
        user: { id: user_id },
        body: { field: "quantity", value: newQuantity, product_id },
      };

      //* Execute middleware function
      await putCartMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "Updated");
    });

    it("Should return '400 Cannot be updated' when no quantity provided", async () => {
      //* Setup new quality
      const newQuantity = undefined; //! wrong value
      //* Mock req object
      const req = {
        user: { id: user_id },
        body: { field: "quantity", value: newQuantity, product_id },
      };

      //* Execute middleware function
      await putCartMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "400 Cannot be updated");
    });
  });

  describe("deleteCartMiddleware", () => {
    //* Setup user_id and product_id
    //? Both of them should permanently present in  the database
    const product_id = 3;
    const user_id = 3;

    let selected;

    beforeEach(async () => {
      //? Retrieve the object of the cart
      //? This will be used for resetting of the product in afterEach
      selected = (
        await db.query(
          `SELECT * FROM ${tableNames.CARTS} WHERE user_id = ${user_id} AND product_id = ${product_id};`
        )
      ).rows[0];
    });

    afterEach(async () => {
      //? Reset recently updated cart
      //? Execute update that will reset the database to its original values
      //? Trycatch should be here because the last test doesn't delete a cart record
      try {
        const queryCommand = `INSERT INTO ${tableNames.CARTS}(user_id, product_id, quantity) VALUES(${user_id}, ${product_id}, ${selected.quantity});`;
        await db.query(queryCommand);
      } catch (error) {}
    });

    it("Should dalete a cart item", async () => {
      //* Mock req object
      const req = {
        body: { product_id },
        user: { id: user_id },
      };

      //* Execute middleware
      await deleteCartMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "204 Successfully deleted");
    });

    it("Should return '400 The operation cannot be done' if product_id is not provided", async () => {
      //* Mock req object
      const req = {
        body: { product_id: undefined },
        user: { id: user_id },
      };

      //* Execute middleware
      await deleteCartMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "400 The operation cannot be done");
    });
  });
});
