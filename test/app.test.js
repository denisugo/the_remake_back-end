const request = require("supertest");
const { executeQuery, simpleQuery, selectByUsername } = require("../queries");
const db = require("../db");
const { tableNames, roles } = require("../config").constants;
require("dotenv").config();

describe("App", () => {
  describe("POST /login", () => {
    describe("Correct cookies", () => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      it("Should log in a user", (done) => {
        const username = "jb";
        const password = "secret";
        server
          .post("/api/v1/login")
          .send({ username, password })
          .expect(200, done);
      });

      it("Should have correct cookies in the next request", (done) => {
        server.get("/api/v1/users/").expect(200, done);
      });
      // it("Should have correct cookies in the next request", (done) => {
      //   server.get("/api/v1/users/1").expect(200, done);
      // });
      // it("Should have correct cookies in the next request, but id in url is incorrect", (done) => {
      //   server.get("/api/v1/users/2").expect(401, done);
      // });
    });

    describe("Incorrect cookies", () => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      it("Should reject login process when password is incorrect", (done) => {
        const username = "jb";
        const password = "fake_password";
        server
          .post("/api/v1/login")
          .send({ username, password })
          .expect(401, done);
      });
    });
  });

  describe("POST /register", () => {
    const username = "ronnie123-456-222";
    const password = "new-secret-pass";
    const email = "ronnie_adams@yandex.ru";
    const first_name = "Ronnie";
    const last_name = "Adams";

    const server = request.agent(`http://localhost:${process.env.PORT}`);

    after(async () => {
      const role = roles.ADMIN_ROLE;
      const tableName = tableNames.USERS;
      const queryCommand =
        "DELETE FROM " +
        tableName +
        " WHERE username = " +
        "'" +
        username +
        "'";
      await executeQuery({ db, role, tableName, queryCommand }, simpleQuery);
    });

    it("Should register a new user", (done) => {
      const body = {
        username,
        password,
        email,
        first_name,
        last_name,
      };

      server.post("/api/v1/register").send(body).expect(200, done);
    });
    it("Should extract a new user from a cookie", (done) => {
      const tableName = tableNames.USERS;
      const role = roles.REGISTERED_ROLE;
      executeQuery({ db, tableName, role, username }, selectByUsername).then(
        ({ id }) => {
          server.get("/api/v1/users/").expect(200, done);
        }
      );
    });
    // it("Should extract a new user from a cookie", (done) => {
    //   const tableName = tableNames.USERS;
    //   const role = roles.REGISTERED_ROLE;
    //   executeQuery({ db, tableName, role, username }, selectByUsername).then(
    //     ({ id }) => {
    //       server.get("/api/v1/users/" + id).expect(200, done);
    //     }
    //   );
    // });
  });

  describe("PUT/users/:id", () => {
    const server = request.agent(`http://localhost:${process.env.PORT}`);

    const username = "jb";
    const password = "secret";
    const id = 1;

    after(async () => {
      //reset user
      const tableName = tableNames.USERS;
      const role = roles.ADMIN_ROLE;
      const first_name = "Joe";
      const queryCommand = `UPDATE ${tableName} SET first_name = '${first_name}' WHERE id = ${id};`;

      await executeQuery({ db, role, tableName, queryCommand }, simpleQuery);
    });

    it("Should change user's first_name", (done) => {
      const body = { field: "first_name", value: "Jankins" };
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .put("/api/v1/users/" + id)
            .send(body)
            .expect(200, done);
        });
    });
  });
  describe("DELETE/users/:id", () => {
    const server = request.agent(`http://localhost:${process.env.PORT}`);

    const username = "jb";
    const password = "secret";
    const id = 2;

    after(async () => {
      // restore user
      const role = roles.ADMIN_ROLE;
      const tableName = tableNames.USERS;
      const username = "davy000";
      const password = "treasure";
      const first_name = "Dave";
      const last_name = "Sinclair";
      const email = "	dave.sin@yahoo.com";
      const is_admin = false;

      const queryCommand = `INSERT INTO ${tableName} VALUES (${id}, '${first_name}', '${last_name}', '${email}', '${username}',${is_admin}, '${password}');`;

      await executeQuery({ db, tableName, role, queryCommand }, simpleQuery);
    });

    it("Should delete user with id of 2", (done) => {
      const body = { id };
      const adminId = 1;
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .delete("/api/v1/users/" + adminId)
            .send(body)
            .expect(204, done);
        });
    });
  });

  describe("GET/products", () => {
    const server = request.agent(`http://localhost:${process.env.PORT}`);

    it("Should send product list", (done) => {
      server.get("/api/v1/products").expect(200, done);
    });
  });
  describe("GET/products?category=health", () => {
    const server = request.agent(`http://localhost:${process.env.PORT}`);

    it("Should send product list", (done) => {
      server.get("/api/v1/products?category=health").expect(200, done);
    });
  });
  describe("GET/products/:id", () => {
    const server = request.agent(`http://localhost:${process.env.PORT}`);

    it("Should send product list", (done) => {
      server.get("/api/v1/products/1").expect(200, done);
    });
  });
  describe("POST/products", () => {
    const body = {
      name: "random",
      description: "something about this product",
      price: 100,
      category: "health",
      preview: "www.preview.com/1",
    };

    afterEach(async () => {
      const tableName = tableNames.PRODUCTS;
      const role = roles.ADMIN_ROLE;
      const queryCommand = `DELETE FROM ${tableName} WHERE name = '${body.name}' AND description = '${body.description}';`;
      await executeQuery({ db, role, tableName, queryCommand }, simpleQuery);
    });

    it("Should add a new product to the product list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jb";
      const password = "secret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.post("/api/v1/products/").send(body).expect(201, done);
        });
    });

    it("Should send 401 when user is not admin", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "davy000";
      const password = "treasure";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.post("/api/v1/products/").send(body).expect(401, done);
        });
    });
  });
  describe("PUT/products/", () => {
    const body = {
      field: "price",
      value: 40,
    };

    after(async () => {
      // reset product
      const role = roles.ADMIN_ROLE;
      const tableName = tableNames.PRODUCTS;
      const name = "Cream";
      const description = "Clear your skin";
      const price = 100;
      const category = "health";
      const preview = "treasure";
      const id = 1;

      const queryCommand = `UPDATE ${tableName} SET (name, description, price, category, preview) = ('${name}', '${description}', '${price}', '${category}', '${preview}') WHERE id = ${id};`;

      await executeQuery({ db, tableName, role, queryCommand }, simpleQuery);
    });

    it("Should edit a product in the product list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jb";
      const password = "secret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.put("/api/v1/products/1").send(body).expect(200, done);
        });
    });
    it("Should send 401 when user is not admin", (done) => {
      const username = "davy000";
      const password = "treasure";
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.put("/api/v1/products/1").send(body).expect(401, done);
        });
    });
  });
  describe("DELETE/products/", () => {
    //TODO: add after that restores the product
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

    it("Should delete a product from the product list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jb";
      const password = "secret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.delete("/api/v1/products/1").expect(204, done);
        });
    });
    it("Should send 401 when user is not admin", (done) => {
      const username = "davy000";
      const password = "treasure";
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.delete("/api/v1/products/1").expect(401, done);
        });
    });
  });

  describe("GET/orders", () => {
    const id = 3;
    const username = "jTest";
    const password = "anotherSecret";

    it("Should receive orders ", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.get(`/api/v1/users/${id}/orders`).expect(200, done);
        });
    });

    it("Should get nothing when unathorized  ", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server.get(`/api/v1/users/${id}/orders`).expect(401, done);
    });
  });
  describe("POST/orders", () => {
    const user_id = 1; // With this user_id order table will be reset by another test
    const transaction_id = 100;
    const body = {
      transaction_id,
      cart: [
        {
          user_id,
          product_id: 3,
          quantity: 5,
        },
      ],
    };

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

    it("Should add a new order to the order list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jb";
      const password = "secret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .post(`/api/v1/users/${user_id}/orders`)
            .send(body)
            .expect(201, done);
        });
    });

    it("Should send 401 when user is not admin", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "davy000";
      const password = "treasure";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .post(`/api/v1/users/${user_id}/orders`)
            .send(body)
            .expect(401, done);
        });
    });
  });
  describe("PUT/orders", () => {
    const id = 1;
    const user_id = 3;
    const product_id = 3;
    const quanttiy = 5;
    const newQuantity = 10;
    const body = { field: "quantity", value: newQuantity, id, product_id };

    afterEach(async () => {
      const tableName = tableNames.ORDERS;
      const role = roles.ADMIN_ROLE;

      const queryCommand = `UPDATE ${tableName} SET quantity = ${quanttiy} WHERE id = ${id} AND product_id = ${product_id};`;

      await executeQuery({ db, role, queryCommand }, simpleQuery);
    });

    it("Should edit an order in the order list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jTest";
      const password = "anotherSecret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .put(`/api/v1/users/${user_id}/orders`)
            .send(body)
            .expect(200, done);
        });
    });
    it("Should send 401 when user is not admin", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "davy000";
      const password = "treasure";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .put(`/api/v1/users/${user_id}/orders`)
            .send(body)
            .expect(401, done);
        });
    });
    it("Should send 401 when user is not registered", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server
        .put(`/api/v1/users/${user_id}/orders`)
        .send(body)
        .expect(401, done);
    });
  });
  describe("DELETE/orders/", () => {
    const id = 1;
    const product_id = 3;
    const order_id = 1;
    const user_id = 3;
    const quanttiy = 5;
    const transaction_id = 10;

    const body = { order_id };

    afterEach(async () => {
      const role = roles.ADMIN_ROLE;

      let tableName = tableNames.ORDERS_USERS;
      let queryCommand = `INSERT INTO ${tableName} (order_id, user_id, transaction_id) VALUES(${order_id}, ${user_id}, ${transaction_id});`;

      await executeQuery({ db, role, queryCommand }, simpleQuery);

      tableName = tableNames.ORDERS;
      queryCommand = `INSERT INTO ${tableName}(id, product_id, quantity) VALUES(${id}, ${product_id}, ${quanttiy}) ;`;

      await executeQuery({ db, role, queryCommand }, simpleQuery);
    });

    it("Should delete an order from the product list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jTest";
      const password = "anotherSecret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .delete(`/api/v1/users/${user_id}/orders`)
            .send(body)
            .expect(204, done);
        });
    });
    it("Should send 401 when user is not admin", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "davy000";
      const password = "treasure";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.delete(`/api/v1/users/${user_id}/orders`).expect(401, done);
        });
    });
  });

  describe("POST/checkout", () => {
    const user_id = 1; // With this user_id order table will be reset by another test
    // const body = {
    //   cart: [
    //     {
    //       user_id,
    //       product_id: 3,
    //       quantity: 5,
    //     },
    //   ],
    // };

    // afterEach(async () => {
    //   const queryCommand = `DELETE FROM orders_users WHERE user_id = ${user_id}`;
    //   const role = roles.ADMIN_ROLE;
    //   await executeQuery({ db, role, queryCommand }, simpleQuery);
    // });

    it("Should checkout an order", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jTest";
      const password = "anotherSecret";
      const user_id = 3;
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .post(`/api/v1/users/${user_id}/cart/checkout`)
            // .send(body)
            .expect(200)
            .end(done);
        });
    });

    // it("Should not checkout an order when no cart provided", (done) => {
    //   const server = request.agent(`http://localhost:${process.env.PORT}`);
    //   const username = "jb";
    //   const password = "secret";
    //   // This user doesnt have a cart
    //   server
    //     .post("/api/v1/login")
    //     .send({ username, password })
    //     .expect(200)
    //     .then(() => {
    //       server
    //         .post(`/api/v1/users/${user_id}/cart/checkout`)
    //         // .send(body)
    //         .expect(404)
    //         .end(done);
    //     });
    // });

    it("Should send 401 when user is not registered", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server
        .post(`/api/v1/users/${user_id}/cart/checkout`)
        // .send(body)
        .expect(401, done);
    });
  });

  describe("GET/cart", () => {
    const id = 3;
    const username = "jTest";
    const password = "anotherSecret";

    it("Should receive a cart ", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.get(`/api/v1/users/${id}/cart`).expect(200, done);
        });
    });

    it("Should get nothing when unathorized  ", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server.get(`/api/v1/users/${id}/orders`).expect(401, done);
    });
  });
  describe("POST/cart", () => {
    const user_id = 1; // With this user_id order table will be reset by another test
    const body = {
      product_id: 3,
      quantity: 5,
    };

    afterEach(async () => {
      const role = roles.ADMIN_ROLE;
      const tableName = tableNames.CARTS;
      const queryCommand = `DELETE FROM ${tableName} WHERE user_id = ${user_id};`;
      await executeQuery({ db, role, queryCommand }, simpleQuery);
    });

    it("Should add a new order to the order list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jb";
      const password = "secret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .post(`/api/v1/users/${user_id}/cart`)
            .send(body)
            .expect(201, done);
        });
    });

    it("Should send 401 when user is not registered", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      server.post(`/api/v1/users/${user_id}/cart`).send(body).expect(401, done);
    });
  });
  describe("PUT/cart", () => {
    const user_id = 3;
    const product_id = 3;

    const newQuantity = 10;
    const body = { field: "quantity", value: newQuantity, product_id };

    afterEach(async () => {
      const tableName = tableNames.CARTS;
      const role = roles.ADMIN_ROLE;

      const quanttiy = 5;

      const queryCommand = `UPDATE ${tableName} SET quantity = ${quanttiy} WHERE user_id = ${user_id} AND product_id = ${product_id};`;

      await executeQuery({ db, role, queryCommand }, simpleQuery);
    });

    it("Should edit an cart item in the cart list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jTest";
      const password = "anotherSecret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .put(`/api/v1/users/${user_id}/cart`)
            .send(body)
            .expect(200, done);
        });
    });

    it("Should send 401 when user is not registered", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      server.put(`/api/v1/users/${user_id}/cart`).send(body).expect(401, done);
    });
  });
  describe("DELETE/cart", () => {
    const product_id = 3;
    const user_id = 3;
    const quanttiy = 5;

    const body = { product_id };

    afterEach(async () => {
      const role = roles.ADMIN_ROLE;
      const tableName = tableNames.CARTS;
      const queryCommand = `INSERT INTO ${tableName}(user_id, product_id, quantity) VALUES(${user_id}, ${product_id}, ${quanttiy}) ;`;

      await executeQuery({ db, role, queryCommand }, simpleQuery);
    });

    it("Should delete a cart item from the cart list", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      const username = "jTest";
      const password = "anotherSecret";
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server
            .delete(`/api/v1/users/${user_id}/cart`)
            .send(body)
            .expect(204, done);
        });
    });
    it("Should send 401 when user is not registered", (done) => {
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      server.delete(`/api/v1/users/${user_id}/cart`).expect(401, done);
    });
  });
});
