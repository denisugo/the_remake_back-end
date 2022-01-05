const { assert } = require("chai");
const {
  simpleQuery,
  executeQuery,
  selectByUsername,
  insertValues,
  selectWithUsernameAndPassword,
  deleteValuesById,
  selectByUserId,
  deleteValuesByOrderId,
  selectById,
  selectOrdersByUserId,
} = require("../queries");
const db = require("../db");
const { tableNames, roles } = require("../config").constants;

const {
  loginVerification,
  userIdVerification,
  isAdminVerification,
} = require("../middlewares/loginMiddlewares");
const { registerMiddleware } = require("../middlewares/registerMiddlewares");

const {
  updateUserMiddleware,
  deleteUserMiddleware,
} = require("../middlewares/userMiddlewares");
const {
  getProductsByCategoryMiddleware,
  getProductByIdMiddleware,
  postProductMiddleware,
  putProductMiddleware,
  deleteProductMiddleware,
} = require("../middlewares/productMiddlewares");
const {
  getOrderByIdMiddleware,
  getOrdersByUserMiddleware,
  postOrderMiddleware,
  putOrderMiddleware,
  deleteOrderMiddleware,
} = require("../middlewares/orderMiddlewares");
const stringCreator = require("../queries/stringCreator");
const {
  getCartByUserMiddleware,
  postCartMiddleware,
  putCartMiddleware,
  deleteCartMiddleware,
} = require("../middlewares/cartMiddlewares");
const {
  postCheckoutMiddleware,
} = require("../middlewares/checkoutMiddlewares");

describe("Middlewares", () => {
  // mocking functions
  const next = () => {
    nextUsed = true;
  };

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

  let nextUsed;
  let sendUsed;

  beforeEach(() => {
    nextUsed = false;
    sendUsed = false;
  });
  describe("loginMiddlewares", () => {
    describe("loginVerification", () => {
      it("Should call next if user is already logged in", () => {
        // req.user should be an object
        const req = { user: {} };

        loginVerification(req, res, next);

        assert.strictEqual(nextUsed, true);
      });

      it("Should send 401 status code and 'Unauthorized' if user is not logged in", () => {
        const req = {};

        loginVerification(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "401 Unauthorized");
      });
    });
    describe("userIdVerification", () => {
      it("Should call next if user id from request and user id from cookie are the same", () => {
        // req.user should be an object
        const req = { user: { id: 1 }, params: { id: "1" } };

        userIdVerification(req, res, next);

        assert.strictEqual(nextUsed, true);
        assert.strictEqual(sendUsed, false);
      });

      it("Should send 401 status code and 'Unauthorized' if user id from request and user id from cookie are not the samen", () => {
        const req = { user: { id: 1 }, params: { id: "2" } };

        userIdVerification(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "401 Unauthorized");
      });
    });
    describe("isAdminVerification", () => {
      it("Should call next if user is_admin is true", () => {
        // req.user should be an object
        const req = { user: { is_admin: true } };

        isAdminVerification(req, res, next);

        assert.strictEqual(nextUsed, true);
        assert.strictEqual(sendUsed, false);
      });

      it("Should send 401 status code and 'Unauthorized' if is_admin is false", () => {
        const req = { user: { is_admin: false } };

        isAdminVerification(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "401 Unauthorized");
      });
    });
  });

  describe("registerMiddlewares", () => {
    const username = "ronnie123_456_222";
    const password = "new-secret-pass";
    const email = "ronnie_adams@yandex.ru";
    const first_name = "Ronnie";
    const last_name = "Adams";
    const tableName = tableNames.USERS;
    const role = roles.ADMIN_ROLE;

    afterEach(async () => {
      const queryCommand =
        "DELETE FROM " +
        tableName +
        " WHERE username = " +
        "'" +
        username +
        "'";
      await executeQuery({ db, role, tableName, queryCommand }, simpleQuery);
    });

    it("Should add a new user to db and", async () => {
      const req = {
        body: {
          username,
          password,
          email,
          first_name,
          last_name,
        },
      };

      registerMiddleware(req, res, next);
      const selected = await executeQuery(
        { db, role, tableName, username },
        selectByUsername
      );

      assert.strictEqual(selected.email, email);
      assert.strictEqual(nextUsed, true);
    });
    it("Should res with status 400 and 'Incomplete' if info is incomplete", async () => {
      const req = {
        body: {
          username,
          password,
          email,

          last_name,
        },
      };

      await registerMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "400 Incomplete");
    });
    it("Should res with status 400 and 'Duplicity found' if there is a duplicated username", async () => {
      const req = {
        body: {
          username: "jb",
          password,
          email,
          first_name,
          last_name,
        },
      };

      await registerMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "400 Duplicity found");
    });
  });

  describe("userMiddlewares", () => {
    describe("updateUserMiddleware", () => {
      const tableName = tableNames.USERS;

      after(async () => {
        // reset user
        const role = roles.ADMIN_ROLE;
        const username = "jb";
        const password = "secret";
        const first_name = "Joe";
        const last_name = "Barbora";
        const email = "joe_barbora@gmail.com";
        const id = 1;

        const queryCommand = `UPDATE ${tableName} SET (username, password, first_name, last_name, email) = ('${username}', '${password}', '${first_name}', '${last_name}', '${email}') WHERE id = ${id};`;

        await executeQuery({ db, tableName, role, queryCommand }, simpleQuery);
      });

      it("Should update email", async () => {
        const newEmail = "jb_star@yahoo.com";
        const req = {
          body: { field: "email", value: newEmail },
          user: { id: 1 },
        };

        await updateUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "200 Updated");
      });
      it("Should return '400 Cannot be updated' when no email provided", async () => {
        const req = {
          body: { field: "email", value: null },
          user: { id: 1 },
        };

        await updateUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 Cannot be updated");
      });

      it("Should update username", async () => {
        const newUsername = "jonny1979";
        const req = {
          body: { field: "username", value: newUsername },
          user: { id: 1 },
        };

        await updateUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "200 Updated");
      });
      it("Should not update username when it violates database rules", async () => {
        const newUsername = "davy000";
        const req = {
          body: { field: "username", value: newUsername },
          user: { id: 1 },
        };

        await updateUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(
          sendUsed,
          "400 This username is probably already in use"
        );
      });

      it("Should update password", async () => {
        const newPassword = "superSecrete";
        const req = {
          body: { field: "password", value: newPassword },
          user: { id: 1 },
        };

        await updateUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "200 Updated");
      });

      it("Should update first_name", async () => {
        const newFirstName = "Lloyd";
        const req = {
          body: { field: "first_name", value: newFirstName },
          user: { id: 1 },
        };

        await updateUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "200 Updated");
      });

      it("Should update last_name", async () => {
        const newLastName = "Lloyd";
        const req = {
          body: { field: "last_name", value: newLastName },
          user: { id: 1 },
        };

        await updateUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "200 Updated");
      });
    });
    describe("deleteUserMiddleware", () => {
      const tableName = tableNames.USERS;

      afterEach(async () => {
        // restore user
        const role = roles.ADMIN_ROLE;
        const username = "jb";
        const password = "secret";
        const first_name = "Joe";
        const last_name = "Barbora";
        const email = "joe_barbora@gmail.com";
        const id = 1;
        const is_admin = true;

        const queryCommand = `INSERT INTO ${tableName} VALUES (${id}, '${first_name}', '${last_name}', '${email}', '${username}',${is_admin}, '${password}');`;

        await executeQuery({ db, tableName, role, queryCommand }, simpleQuery);
      });

      it("Should delete user by id", async () => {
        const id = 1;
        const req = { body: { id } };

        await deleteUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "204 Successfully deleted");
      });

      it("Should not delete user if id is not provided", async () => {
        const req = { id: undefined };

        await deleteUserMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 The operation cannot be done");
      });
    });
  });

  describe("productMiddlewares", () => {
    describe("getProductsByCategoryMiddleware", () => {
      it("Should send back a list filtered by category", async () => {
        const category = "health";
        const req = { query: { category } };

        await getProductsByCategoryMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.isArray(sendUsed.products);
        assert.isObject(sendUsed.products[0]);
      });
      it("Should send back a list with all products", async () => {
        const category = "The Kroger__"; // wrong category
        const req = { query: { category } };

        await getProductsByCategoryMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.isArray(sendUsed.products);
        assert.isObject(sendUsed.products[0]);
      });
    });

    describe("getProductByIdMiddleware", () => {
      it("Should send back the product", async () => {
        const id = 1;
        const req = { params: { id } };

        await getProductByIdMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.isObject(sendUsed);
      });
      it("Should send back 404 Not found when id is incorrect", async () => {
        const id = 1000;
        const req = { params: { id } };

        await getProductByIdMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "404 Not found");
      });
    });

    describe("postProductMiddleware", () => {
      const name = "La cream";
      const description = "Cares of your skin";
      const price = 1;
      const category = "health";
      const preview = "www";

      afterEach(async () => {
        const tableName = tableNames.PRODUCTS;
        const role = roles.ADMIN_ROLE;
        const queryCommand = `DELETE FROM ${tableName} WHERE name = '${name}' AND description = '${description}';`;
        await executeQuery({ db, role, tableName, queryCommand }, simpleQuery);
      });

      it("Should add a new product", async () => {
        const body = {
          name,
          description,
          price,
          category,
          preview,
        };
        const req = { body };

        await postProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed.split(" ")[0], "201");
      });
      it("Should send back 400 Check your input", async () => {
        const body = {
          name,
          description,
          price,
          // category,
          preview,
        };
        const req = { body };

        await postProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 Check your input");
      });
    });

    describe("putProductMiddleware", () => {
      const name = "La cream";
      const description = "Cares of your skin";
      const price = 1;
      const category = "health";
      const preview = "www";

      after(async () => {
        // reset product
        const role = roles.ADMIN_ROLE;
        const tableName = tableNames.PRODUCTS;
        const name = "Cream";
        const description = "Clear your skin";
        const price = 100;
        const category = "health";
        const preview =
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80";
        const id = 1;

        const queryCommand = `UPDATE ${tableName} SET (name, description, price, category, preview) = ('${name}', '${description}', '${price}', '${category}', '${preview}') WHERE id = ${id};`;

        await executeQuery({ db, tableName, role, queryCommand }, simpleQuery);
      });

      it("Should update a product's name", async () => {
        const newName = "Avocado cream";
        const req = {
          body: { field: "name", value: newName },
          params: { id: 1 },
        };

        await putProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "Updated");
      });
      it("Should return '400 Cannot be updated' when no name provided", async () => {
        const newName = "Avocado cream";
        const req = {
          body: { field: "name", value: null },
          params: { id: 1 },
        };

        await putProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 Cannot be updated");
      });

      //  Tests could be expended for all columns in products table, althought admin role got full access to all tables, so it should cover all columns
    });

    describe("deleteProductMiddleware", () => {
      const name = "La cream";
      const description = "Cares of your skin";
      const price = 1;
      const category = "health";
      const preview = "www";

      after(async () => {
        // restore product
        const role = roles.ADMIN_ROLE;
        const tableName = tableNames.PRODUCTS;
        const name = "Cream";
        const description = "Clear your skin";
        const price = 100;
        const category = "health";
        const preview =
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80";
        const id = 1;

        const queryCommand = `INSERT INTO ${tableName} VALUES (${id}, '${name}', '${description}', ${price}, '${category}','${preview}');`;

        await executeQuery({ db, tableName, role, queryCommand }, simpleQuery);
      });

      it("Should dalete a product", async () => {
        const req = {
          params: { id: 1 },
        };

        await deleteProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "204 Successfully deleted");
      });

      it("Should return '400 The operation cannot be done' if id is not provided", async () => {
        const req = {
          params: { id: undefined },
        };

        await deleteProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 The operation cannot be done");
      });
    });
  });

  describe("orderMiddleware", () => {
    describe("getOrderByIdMiddleware", () => {
      it("Should send back an array", async () => {
        const req = {
          params: { id: 1 },
        };

        await getOrderByIdMiddleware(req, res, next);

        assert.isArray(sendUsed);
        assert.isObject(sendUsed[0]);
        assert.strictEqual(nextUsed, false);
      });
      it("Should send back an empty array when id is incorrect", async () => {
        const req = {
          params: { id: 90 },
        };

        await getOrderByIdMiddleware(req, res, next);

        assert.isArray(sendUsed);
        assert.isUndefined(sendUsed[0]);
        assert.strictEqual(nextUsed, false);
      });
    });

    describe("getOrdersByUserMiddleware", () => {
      it("Should send back an object", async () => {
        const req = {
          user: { id: 3 }, // id=3 in real db for testing purposes
        };

        await getOrdersByUserMiddleware(req, res, next);
        console.log(sendUsed);
        assert.isArray(sendUsed[1].products); // 1 - is the order id in db
        assert.isObject(sendUsed[1].products[0]);
        assert.isBoolean(sendUsed[1].shipped);
        assert.strictEqual(nextUsed, false);
      });
      it("Should send back an empty object when id is incorrect", async () => {
        const req = {
          user: { id: 1000 },
        };

        await getOrdersByUserMiddleware(req, res, next);

        //assert.isArray(sendUsed[1]);
        assert.isObject(sendUsed);
        assert.isUndefined(sendUsed[1]); // 1 - is the order id in db
        assert.strictEqual(nextUsed, false);
      });
    });

    describe("postOrderMiddleware", () => {
      const user_id = 1; // With this user_id order table will be reset by another test
      const transaction_id = 100;

      beforeEach(async () => {
        const tableName = tableNames.CARTS;
        const queryCommand = `INSERT INTO ${tableName} ( user_id, product_id, quantity) VALUES( ${user_id}, ${1}, ${1});`;
        const role = roles.ADMIN_ROLE;
        await executeQuery({ db, role, queryCommand }, simpleQuery);
      });

      afterEach(async () => {
        const queryCommand = `DELETE FROM orders_users WHERE user_id = ${user_id}`;
        const role = roles.ADMIN_ROLE;
        await executeQuery({ db, role, queryCommand }, simpleQuery);
      });

      it("Should post a new order item", async () => {
        const req = {
          user: { id: user_id },
          body: {
            transaction_id,
          },
        };

        await postOrderMiddleware(req, res, next);

        assert.strictEqual(sendUsed, "201 Your order has been placed");
        assert.strictEqual(nextUsed, false);

        const queryCommand = `SELECT * FROM ${tableNames.CARTS} WHERE user_id = ${user_id}`;
        const role = roles.ADMIN_ROLE;
        const selected = await executeQuery(
          { db, role, queryCommand },
          simpleQuery
        );
        assert.strictEqual(selected.length, 0);
      });
      it("Should not post if the cart hasnt any item", async () => {
        const req = {
          user: { id: user_id },
        };

        await postOrderMiddleware(req, res, next);

        assert.strictEqual(sendUsed, "400 Check your cart");
        assert.strictEqual(nextUsed, false);
      });
    });

    describe("putOrderMiddleware", () => {
      const id = 1;
      const product_id = 3;

      afterEach(async () => {
        const tableName = tableNames.ORDERS;
        const role = roles.ADMIN_ROLE;

        const quanttiy = 5;

        const queryCommand = `UPDATE ${tableName} SET quantity = ${quanttiy} WHERE id = ${id} AND product_id = ${product_id};`;

        await executeQuery({ db, role, queryCommand }, simpleQuery);
      });

      it("Should update a quantity", async () => {
        const newQuantity = 10;
        const req = {
          body: { field: "quantity", value: newQuantity, id, product_id },
        };

        await putOrderMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "Updated");
      });

      it("Should return '400 Cannot be updated' when no id provided", async () => {
        const newQuantity = 10;
        const req = {
          body: {
            field: "quantity",
            value: newQuantity,
            id: undefined,
            product_id,
          },
        };

        await putOrderMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 Cannot be updated");
      });

      it("Should return '400 Cannot be updated' when no quantity provided", async () => {
        const newQuantity = undefined;
        const req = {
          body: { field: "quantity", value: newQuantity, id, product_id },
        };

        await putOrderMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 Cannot be updated");
      });
    });

    describe("deleteOrderMiddleware", () => {
      const id = 1;
      const product_id = 3;
      const order_id = 1;
      const user_id = 3;
      const quanttiy = 5;
      const transaction_id = 10;

      afterEach(async () => {
        const role = roles.ADMIN_ROLE;

        let tableName = tableNames.ORDERS_USERS;
        let queryCommand = `INSERT INTO ${tableName} (order_id, user_id, transaction_id) VALUES(${order_id}, ${user_id}, ${transaction_id});`;

        await executeQuery({ db, role, queryCommand }, simpleQuery);

        tableName = tableNames.ORDERS;
        queryCommand = `INSERT INTO ${tableName}(id, product_id, quantity) VALUES(${id}, ${product_id}, ${quanttiy}) ;`;

        await executeQuery({ db, role, queryCommand }, simpleQuery);
      });

      it("Should dalete an order", async () => {
        const req = {
          body: { order_id },
          params: { id },
        };

        await deleteOrderMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "204 Successfully deleted");

        const order = await getOrderByIdMiddleware(req, res, next);

        assert.isUndefined(order[0]);
      });

      it("Should return '400 The operation cannot be done' if order_id is not provided", async () => {
        const req = {
          body: { order_id: undefined },
          params: { id },
        };

        await deleteOrderMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 The operation cannot be done");

        const order = await getOrderByIdMiddleware(req, res, next);

        assert.isObject(order[0]);
      });
    });
  });

  describe("cartMiddleware", () => {
    describe("getCartByUserMiddleware", () => {
      it("Should send back an array", async () => {
        const req = {
          user: { id: 3 },
        };

        await getCartByUserMiddleware(req, res, next);

        assert.isArray(sendUsed);
        // assert.isArray(sendUsed.cart);
        assert.isObject(sendUsed[0]);
        // assert.isObject(sendUsed.cart[0]);
        assert.strictEqual(nextUsed, false);
      });
      it("Should send back an empty array when id is incorrect", async () => {
        const req = {
          user: { id: 90 },
        };

        await getCartByUserMiddleware(req, res, next);

        assert.isArray(sendUsed);
        // assert.isArray(sendUsed.cart);
        assert.isUndefined(sendUsed[0]);
        // assert.isUndefined(sendUsed.cart[0]);
        assert.strictEqual(nextUsed, false);
      });
    });

    describe("postCartMiddleware", () => {
      const user_id = 1; // With this user_id order table will be reset by another test

      afterEach(async () => {
        const role = roles.ADMIN_ROLE;
        const tableName = tableNames.CARTS;
        const queryCommand = `DELETE FROM ${tableName} WHERE user_id = ${user_id};`;
        await executeQuery({ db, role, queryCommand }, simpleQuery);
      });

      it("Should post a new cart item", async () => {
        const req = {
          user: { id: user_id },
          body: {
            product_id: 3,
            quantity: 5,
          },
        };

        await postCartMiddleware(req, res, next);

        assert.strictEqual(sendUsed, "201 Added to the cart");
        assert.strictEqual(nextUsed, false);
      });
      it("Should not post if the body hasnt some item", async () => {
        const req = {
          user: { id: user_id },
          body: {
            product_id: 3,
            quantity: undefined,
          },
        };

        await postCartMiddleware(req, res, next);

        assert.strictEqual(sendUsed, "400 Check your cart");
        assert.strictEqual(nextUsed, false);
      });

      it("Should not post if the body violates constrains", async () => {
        const req = {
          user: { id: user_id },
          body: {
            product_id: 30, //this product doesn exist
            quantity: 1,
          },
        };

        await postCartMiddleware(req, res, next);

        assert.strictEqual(sendUsed, "400 Check your cart");
        assert.strictEqual(nextUsed, false);
      });
    });

    describe("putCartMiddleware", () => {
      const user_id = 3;
      const product_id = 3;

      afterEach(async () => {
        const tableName = tableNames.CARTS;
        const role = roles.ADMIN_ROLE;

        const quanttiy = 5;

        const queryCommand = `UPDATE ${tableName} SET quantity = ${quanttiy} WHERE user_id = ${user_id} AND product_id = ${product_id};`;

        await executeQuery({ db, role, queryCommand }, simpleQuery);
      });

      it("Should update a quantity", async () => {
        const newQuantity = 10;
        const req = {
          user: { id: user_id },
          body: { field: "quantity", value: newQuantity, product_id },
        };

        await putCartMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "Updated");
      });

      it("Should return '400 Cannot be updated' when no quantity provided", async () => {
        const newQuantity = undefined;
        const req = {
          user: { id: user_id },
          body: { field: "quantity", value: newQuantity, product_id },
        };

        await putCartMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 Cannot be updated");
      });
    });

    describe("deleteCartMiddleware", () => {
      const product_id = 3;
      const user_id = 3;
      const quanttiy = 5;

      afterEach(async () => {
        const role = roles.ADMIN_ROLE;
        const tableName = tableNames.CARTS;
        const queryCommand = `INSERT INTO ${tableName}(user_id, product_id, quantity) VALUES(${user_id}, ${product_id}, ${quanttiy}) ;`;

        await executeQuery({ db, role, queryCommand }, simpleQuery);
      });

      it("Should dalete a cart item", async () => {
        const req = {
          body: { product_id },
          user: { id: user_id },
        };

        await deleteCartMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "204 Successfully deleted");
      });

      it("Should return '400 The operation cannot be done' if product_id is not provided", async () => {
        const req = {
          body: { product_id: undefined },
          user: { id: user_id },
        };

        await deleteCartMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 The operation cannot be done");
      });
    });
  });

  describe("checkoutMiddleware", () => {
    describe("postCheckoutMiddleware", () => {
      it("Should post a checkout", async () => {
        const user_id = 3; // This user already has its cart
        const req = {
          user: { id: user_id },
        };

        await postCheckoutMiddleware(req, res, next);

        assert.isObject(sendUsed);
        assert.isString(sendUsed.clientSecret);
        assert.strictEqual(sendUsed.amount, 450); // this user has only one item in his cart with price of 90 and quantity of 5

        assert.strictEqual(nextUsed, false);
      });
      it("Should not post if the user has not items in his cart", async () => {
        const user_id = 1; // Doesnt have any items
        const req = {
          user: { id: user_id },
        };

        await postCheckoutMiddleware(req, res, next);

        assert.strictEqual(sendUsed, "404 No cart found");
        assert.strictEqual(nextUsed, false);
      });
    });
  });

  describe("FK", () => {
    const role = roles.ADMIN_ROLE;
    let user;
    let product;
    let orders_users;
    let cart;
    let order;

    beforeEach(() => {
      user = {
        first_name: "Dmitry",
        last_name: "Sorokin",
        email: "dimasik@gmail.com",
        username: "dima",
        password: "keepInSecret",
      };

      product = {
        name: "Biscuits",
        price: 100,
        description: "Cockies for yor dinner",
        category: "Food",
        preview: "www",
      };

      orders_users = {
        user_id: undefined,
        transaction_id: 100,
      };

      cart = {
        user_id: undefined,
        product_id: undefined,
        quantity: 10,
      };

      order = {
        id: undefined,
        product_id: undefined,
        quantity: 10,
      };
    });
    describe("users, orders_users, orders", () => {
      it("Should delete items in both tables", async () => {
        const newUser = stringCreator.users(user);
        await executeQuery(
          { db, role, tableName: tableNames.USERS, ...newUser },
          insertValues
        );

        let selectedUser = await executeQuery(
          { db, role, tableName: tableNames.USERS, ...user },
          selectWithUsernameAndPassword
        );

        // Confirmation that the user has successfully created
        assert.isObject(selectedUser, "user created");

        orders_users.user_id = selectedUser.id;

        const newOrdersUsers = stringCreator.orders_users(orders_users);

        await executeQuery(
          { db, role, tableName: tableNames.ORDERS_USERS, ...newOrdersUsers },
          insertValues
        );

        let selectedOrdersUsers = await executeQuery(
          { db, role, tableName: tableNames.ORDERS_USERS, ...orders_users },
          selectByUserId
        );

        // Confirmation that the orders_users item has successfully created
        assert.isObject(selectedOrdersUsers[0], "orders_users created");

        order.product_id = 3;
        order.id = selectedOrdersUsers[0].order_id;

        const newOrder = stringCreator.orders(order);

        await executeQuery(
          { db, role, tableName: tableNames.ORDERS, ...newOrder },
          insertValues
        );

        let selectedOrder = await executeQuery(
          { db, role, tableName: tableNames.ORDERS, ...order },
          selectById
        );

        //Confirmation that the order item has successfully created
        assert.isObject(selectedOrder, "order created");

        //Deleting the user
        await executeQuery(
          { db, role, tableName: tableNames.USERS, id: selectedUser.id },
          deleteValuesById
        );

        selectedOrdersUsers = await executeQuery(
          { db, role, tableName: tableNames.ORDERS_USERS, ...orders_users },
          selectByUserId
        );

        // Confirmation that the orders_users item has successfully removed
        assert.isUndefined(selectedOrdersUsers[0], "orders_users deleted");

        selectedUser = await executeQuery(
          { db, role, tableName: tableNames.USERS, ...user },
          selectWithUsernameAndPassword
        );

        // Confirmation that the user has successfully removed
        assert.isUndefined(selectedUser, "user deleted");

        selectedOrder = await executeQuery(
          { db, role, tableName: tableNames.ORDERS, ...order },
          selectById
        );

        // Confirmation that the order item has successfully removed
        assert.isUndefined(selectedOrder, "order item  deleted");
      });
    });

    describe("users, carts", () => {
      it("Should delete items in both tables", async () => {
        const newUser = stringCreator.users(user);
        await executeQuery(
          { db, role, tableName: tableNames.USERS, ...newUser },
          insertValues
        );

        let selectedUser = await executeQuery(
          { db, role, tableName: tableNames.USERS, ...user },
          selectWithUsernameAndPassword
        );

        // Confirmation that the user has successfully created
        assert.isObject(selectedUser, "user created");

        cart.user_id = selectedUser.id;
        cart.product_id = 3;

        const newCart = stringCreator.cart(cart);

        await executeQuery(
          { db, role, tableName: tableNames.CARTS, ...newCart },
          insertValues
        );

        let selectedCart = await executeQuery(
          { db, role, tableName: tableNames.CARTS, ...cart },
          selectByUserId
        );

        // Confirmation that the cart item has successfully created
        assert.isObject(selectedCart[0], "cart created");

        //Deleting the user
        await executeQuery(
          { db, role, tableName: tableNames.USERS, id: selectedUser.id },
          deleteValuesById
        );

        selectedCart = await executeQuery(
          { db, role, tableName: tableNames.CARTS, ...cart },
          selectByUserId
        );

        // Confirmation that the cart item has successfully removed
        assert.isUndefined(selectedCart[0], "cart deleted");

        selectedUser = await executeQuery(
          { db, role, tableName: tableNames.USERS, ...user },
          selectWithUsernameAndPassword
        );

        // Confirmation that the user has successfully removed
        assert.isUndefined(selectedUser, "user deleted");
      });
    });

    describe("products, orders, carts", () => {
      it("Should delete items in both tables", async () => {
        const newProduct = stringCreator.products(product);

        // getting product id
        const { id } = await executeQuery(
          { db, role, tableName: tableNames.PRODUCTS, ...newProduct },
          insertValues
        );

        let selectedProduct = await executeQuery(
          { db, role, tableName: tableNames.PRODUCTS, id },
          selectById
        );

        // Confirmation that the user has successfully created
        assert.isObject(selectedProduct, "product created");

        cart.user_id = 3;
        cart.product_id = id;

        const newCart = stringCreator.cart(cart);

        await executeQuery(
          { db, role, tableName: tableNames.CARTS, ...newCart },
          insertValues
        );

        const queryCommandForCart = `SELECT * FROM ${tableNames.CARTS} WHERE product_id = ${id};`;
        let selectedCart = await executeQuery(
          { db, role, queryCommand: queryCommandForCart },
          simpleQuery
        );
        // Confirmation that the cart item has successfully created
        assert.isObject(selectedCart[0], "cart created");

        order.id = 1;
        order.product_id = id;

        const newOrder = stringCreator.orders(order);

        await executeQuery(
          { db, role, tableName: tableNames.ORDERS, ...newOrder },
          insertValues
        );

        const queryCommandForOrder = `SELECT * FROM ${tableNames.ORDERS} WHERE product_id = ${id};`;

        let selectedOrder = await executeQuery(
          { db, role, queryCommand: queryCommandForOrder },
          simpleQuery
        );

        // Confirmation that the order item has successfully created
        assert.isObject(selectedOrder[0], "order created");

        //Deleting the product
        await executeQuery(
          { db, role, tableName: tableNames.PRODUCTS, id: id },
          deleteValuesById
        );

        selectedCart = await executeQuery(
          { db, role, queryCommand: queryCommandForCart },
          simpleQuery
        );

        // Confirmation that the cart item has successfully removed
        assert.isUndefined(selectedCart[0], "cart deleted");

        selectedOrder = await executeQuery(
          { db, role, queryCommand: queryCommandForOrder },
          simpleQuery
        );

        // Confirmation that the cart item has successfully removed
        assert.isUndefined(selectedOrder[0], "order deleted");

        selectedProduct = await executeQuery(
          { db, role, tableName: tableNames.PRODUCTS, id },
          selectById
        );

        // Confirmation that the user has successfully removed
        assert.isUndefined(selectedProduct, "product deleted");
      });
    });
  });
});
