const { assert } = require("chai");
const db = require("../../db");
const { tableNames } = require("../../config").constants;

const {
  getOrdersByUserMiddleware,
  postOrderMiddleware,
} = require("../../middlewares/orderMiddlewares");

describe("orderMiddleware", () => {
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

  describe("getOrdersByUserMiddleware", () => {
    it("Should send back an object", async () => {
      //* Mock req object
      const req = {
        user: { id: 3 }, //? This user already has an order
      };

      //* Execute middleware
      await getOrdersByUserMiddleware(req, res, next);

      assert.isArray(sendUsed[1].products); //? 1 - is the order id of user with id=3 in database
      assert.isObject(sendUsed[1].products[0]);
      assert.isBoolean(sendUsed[1].shipped);
      assert.strictEqual(nextUsed, false);
    });
    it("Should send back an empty object when id is incorrect", async () => {
      //* Mock req object
      const req = {
        user: { id: 1000 }, //? This user doesn't exist
      };

      //* Execute middleware
      await getOrdersByUserMiddleware(req, res, next);

      //assert.isArray(sendUsed[1]);
      assert.isObject(sendUsed);
      assert.isUndefined(sendUsed[1]); // 1 - is the order id in db
      assert.strictEqual(nextUsed, false);
    });
  });

  describe("postOrderMiddleware", () => {
    //* Setup user id
    //? This id does not present in carts table
    const user_id = 1;
    const transaction_id = 100;

    beforeEach(async () => {
      //* Add a new record to carts table
      //? product_id and quantity are set to 1
      const queryCommand = `INSERT INTO ${
        tableNames.CARTS
      } ( user_id, product_id, quantity) VALUES( ${user_id}, ${1}, ${1});`;
      await db.query(queryCommand);
    });

    afterEach(async () => {
      //? Delete the newly created record in the db in orders_users table
      const queryCommand = `DELETE FROM ${tableNames.ORDERS_USERS} WHERE user_id = ${user_id};`;
      await db.query(queryCommand);
    });

    afterEach(async () => {
      //? Delete the newly created record in the db in carts table
      const queryCommand = `DELETE FROM ${tableNames.CARTS} WHERE user_id = ${user_id};`;
      await db.query(queryCommand);
    });

    it("Should post a new order item", async () => {
      //* Mock req object
      const req = {
        user: { id: user_id },
        body: {
          transaction_id,
        },
      };

      //* Execute middleware
      await postOrderMiddleware(req, res, next);

      assert.strictEqual(sendUsed, "201 Your order has been placed");
      assert.strictEqual(nextUsed, false);

      //* Check if cart record was deleted
      const queryCommand = `SELECT * FROM ${tableNames.CARTS} WHERE user_id = ${user_id}`;

      const selected = (await db.query(queryCommand)).rows;
      assert.strictEqual(selected.length, 0);
    });
    it("Should not post if the cart hasnt any item", async () => {
      //* Mock req object
      const req = {
        user: { id: user_id },
      };
      //* Execute query
      await postOrderMiddleware(req, res, next);

      assert.strictEqual(sendUsed, "400 Check your cart");
      assert.strictEqual(nextUsed, false);
    });
  });

  // describe("putOrderMiddleware", () => {
  //   const id = 1;
  //   const product_id = 3;

  //   afterEach(async () => {
  //     const tableName = tableNames.ORDERS;
  //     const role = roles.ADMIN_ROLE;

  //     const quanttiy = 5;

  //     const queryCommand = `UPDATE ${tableName} SET quantity = ${quanttiy} WHERE id = ${id} AND product_id = ${product_id};`;

  //     await executeQuery({ db, role, queryCommand }, simpleQuery);
  //   });

  //   it("Should update a quantity", async () => {
  //     const newQuantity = 10;
  //     const req = {
  //       body: { field: "quantity", value: newQuantity, id, product_id },
  //     };

  //     await putOrderMiddleware(req, res, next);

  //     assert.strictEqual(nextUsed, false);
  //     assert.strictEqual(sendUsed, "Updated");
  //   });

  //   it("Should return '400 Cannot be updated' when no id provided", async () => {
  //     const newQuantity = 10;
  //     const req = {
  //       body: {
  //         field: "quantity",
  //         value: newQuantity,
  //         id: undefined,
  //         product_id,
  //       },
  //     };

  //     await putOrderMiddleware(req, res, next);

  //     assert.strictEqual(nextUsed, false);
  //     assert.strictEqual(sendUsed, "400 Cannot be updated");
  //   });

  //   it("Should return '400 Cannot be updated' when no quantity provided", async () => {
  //     const newQuantity = undefined;
  //     const req = {
  //       body: { field: "quantity", value: newQuantity, id, product_id },
  //     };

  //     await putOrderMiddleware(req, res, next);

  //     assert.strictEqual(nextUsed, false);
  //     assert.strictEqual(sendUsed, "400 Cannot be updated");
  //   });
  // });

  // describe("deleteOrderMiddleware", () => {
  //   const id = 1;
  //   const product_id = 3;
  //   const order_id = 1;
  //   const user_id = 3;
  //   const quanttiy = 5;
  //   const transaction_id = 10;

  //   afterEach(async () => {
  //     const role = roles.ADMIN_ROLE;

  //     let tableName = tableNames.ORDERS_USERS;
  //     let queryCommand = `INSERT INTO ${tableName} (order_id, user_id, transaction_id) VALUES(${order_id}, ${user_id}, ${transaction_id});`;

  //     await executeQuery({ db, role, queryCommand }, simpleQuery);

  //     tableName = tableNames.ORDERS;
  //     queryCommand = `INSERT INTO ${tableName}(id, product_id, quantity) VALUES(${id}, ${product_id}, ${quanttiy}) ;`;

  //     await executeQuery({ db, role, queryCommand }, simpleQuery);
  //   });

  //   it("Should dalete an order", async () => {
  //     const req = {
  //       body: { order_id },
  //       params: { id },
  //     };

  //     await deleteOrderMiddleware(req, res, next);

  //     assert.strictEqual(nextUsed, false);
  //     assert.strictEqual(sendUsed, "204 Successfully deleted");

  //     const order = await getOrderByIdMiddleware(req, res, next);

  //     assert.isUndefined(order[0]);
  //   });

  //   it("Should return '400 The operation cannot be done' if order_id is not provided", async () => {
  //     const req = {
  //       body: { order_id: undefined },
  //       params: { id },
  //     };

  //     await deleteOrderMiddleware(req, res, next);

  //     assert.strictEqual(nextUsed, false);
  //     assert.strictEqual(sendUsed, "400 The operation cannot be done");

  //     const order = await getOrderByIdMiddleware(req, res, next);

  //     assert.isObject(order[0]);
  //   });
  // });
});
