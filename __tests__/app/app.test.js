const request = require("supertest");
const {
  executeQuery,
  simpleQuery,
  selectByUsername,
} = require("../../queries");
const db = require("../../db");
const { tableNames, roles } = require("../../config").constants;
require("dotenv").config();

describe("App", () => {
  describe("POST /login", () => {
    describe("Correct cookies", () => {
      //* Initial setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      it("Should log in a user", (done) => {
        //* Credentials
        const username = "jb";
        const password = "secret";
        //* Create a request
        server
          .post("/api/v1/login")
          .send({ username, password })
          .expect(200, done);
      });

      it("Should have correct cookies in the next request", (done) => {
        //* Create a request
        server.get("/api/v1/users/").expect(200, done);
      });
    });

    describe("Incorrect cookies", () => {
      //* Initial setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      it("Should reject login process when password is incorrect", (done) => {
        //* Credentials
        const username = "jb";
        const password = "fake_password";
        //* Create a request
        server
          .post("/api/v1/login")
          .send({ username, password })
          .expect(401, done);
      });
    });
  });

  describe("POST /register", () => {
    //* New user parameters
    const body = {
      username: "ronnie123_456_222",
      password: "new-secret-pass",
      email: "ronnie_adams@yandex.ru",
      first_name: "Ronnie",
      last_name: "Adams",
    };

    //* Initial server setup
    const server = request.agent(`http://localhost:${process.env.PORT}`);

    afterEach(async () => {
      //? This will remove newly created user from users table
      const queryCommand = `DELETE FROM ${tableNames.USERS} WHERE username = '${body.username}' RETURNING *;`;
      await db.query(queryCommand);
    });

    it("Should register a new user", (done) => {
      //* Create a request
      server
        .post("/api/v1/register")
        .send(body)
        .expect(200)
        .then(() => {
          server.get("/api/v1/users").expect(200, done);
        });
    });
  });

  describe("PUT/users/", () => {
    //* Initial server setup
    const server = request.agent(`http://localhost:${process.env.PORT}`);

    //* Credentials
    const username = "jb";
    const password = "secret";
    const id = 1;

    let selected;

    beforeEach(async () => {
      //? Retrieve the object of the user
      //? This will be used for resetting of the product in afterEach
      selected = (
        await db.query(`SELECT * FROM ${tableNames.USERS} WHERE id = ${id};`)
      ).rows[0];
    });

    afterEach(async () => {
      //? Reset recently updated product
      //? Execute update that will reset the query to its original values
      const queryCommand = `UPDATE ${tableNames.USERS} SET (username, password, first_name, last_name, email) = ('${selected.username}', '${selected.password}', '${selected.first_name}', '${selected.last_name}', '${selected.email}') WHERE id = ${id};`;
      await db.query(queryCommand);
    });

    it("Should change user's first_name", (done) => {
      //? Preparing body for sending
      const body = { field: "first_name", value: "Jankins" };
      //* Create a request
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.put("/api/v1/users/").send(body).expect(200, done);
        });
    });
  });

  describe("GET/products", () => {
    //* Initial server setup
    const server = request.agent(`http://localhost:${process.env.PORT}`);

    it("Should send product list", (done) => {
      //* Create a request
      server.get("/api/v1/products").expect(200, done);
    });
  });
  describe("POST/products", () => {
    //? Preparing body for sending
    const body = {
      name: "random",
      description: "something about this product",
      price: 100,
      category: "health",
      preview: "www.preview.com/1",
    };

    afterEach(async () => {
      //? Delete the newly created record in the db
      const queryCommand = `DELETE FROM ${tableNames.PRODUCTS} WHERE name = '${body.name}' AND description = '${body.description}';`;
      await db.query(queryCommand);
    });

    it("Should add a new product to the product list", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Credentials
      const username = "jb";
      const password = "secret";
      //* Create a request
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.post("/api/v1/products/").send(body).expect(201, done);
        });
    });

    it("Should send 401 when user is not admin", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Credentials
      const username = "davy000";
      const password = "treasure";
      //* Create a request
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
    //? Preparing body for sending
    const body = {
      field: "price",
      value: 40,
    };

    let selected;

    const id = 1;

    beforeEach(async () => {
      //? Retrieve the object of the product
      //? This will be used for resetting of the product in afterEach
      selected = (
        await db.query(`SELECT * FROM ${tableNames.PRODUCTS} WHERE id = ${id};`)
      ).rows[0];
    });

    afterEach(async () => {
      //? Reset recently updated product
      //? Execute update that will reset the query to its original values
      const queryCommand = `UPDATE ${tableNames.PRODUCTS} SET (name, description, price, category, preview) = ('${selected.name}', '${selected.description}', '${selected.price}', '${selected.category}', '${selected.preview}') WHERE id = ${id};`;
      await db.query(queryCommand);
    });

    it("Should edit a product in the product list", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Credentials
      const username = "jb";
      const password = "secret";
      //* Create a request
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.put("/api/v1/products/1").send(body).expect(200, done);
        });
    });
    it("Should send 401 when user is not admin", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Credentials
      const username = "davy000";
      const password = "treasure";
      //* Create a request
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
    let selected;

    const id = 1;

    beforeEach(async () => {
      //? Retrieve the object of the product
      //? This will be used for resetting of the product in afterEach
      selected = (
        await db.query(`SELECT * FROM ${tableNames.PRODUCTS} WHERE id = ${id};`)
      ).rows[0];
    });

    afterEach(async () => {
      //? This query should restore the original object
      //? Trycatch block should be here because the last test won't delete the product,
      //? so it will throw an error that this inserting violates primary key, because of the same id
      try {
        const queryCommand = `INSERT INTO ${tableNames.PRODUCTS} VALUES (${id}, '${selected.name}', '${selected.description}', ${selected.price}, '${selected.category}','${selected.preview}');`;
        await db.query(queryCommand);
      } catch (error) {}
    });

    it("Should delete a product from the product list", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Credentials
      const username = "jb";
      const password = "secret";
      //* Create a request
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.delete("/api/v1/products/1").expect(204, done);
        });
    });
    it("Should send 401 when user is not admin", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Credentials
      const username = "davy000";
      const password = "treasure";
      //* Create a request
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.delete("/api/v1/products/1").expect(401, done);
        });
    });
  });

  // describe("GET/orders", () => {
  //   const id = 3;
  //   const username = "jTest";
  //   const password = "anotherSecret";

  //   it("Should receive orders ", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     server
  //       .post("/api/v1/login")
  //       .send({ username, password })
  //       .expect(200)
  //       .then(() => {
  //         server.get(`/api/v1/users/${id}/orders`).expect(200, done);
  //       });
  //   });

  //   it("Should get nothing when unathorized  ", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     server.get(`/api/v1/users/${id}/orders`).expect(401, done);
  //   });
  // });
  // describe("POST/orders", () => {
  //   const user_id = 1; // With this user_id order table will be reset by another test
  //   const transaction_id = 100;
  //   const body = {
  //     transaction_id,
  //     cart: [
  //       {
  //         user_id,
  //         product_id: 3,
  //         quantity: 5,
  //       },
  //     ],
  //   };

  //   beforeEach(async () => {
  //     const tableName = tableNames.CARTS;
  //     const queryCommand = `INSERT INTO ${tableName} ( user_id, product_id, quantity) VALUES( ${user_id}, ${1}, ${1});`;
  //     const role = roles.ADMIN_ROLE;
  //     await executeQuery({ db, role, queryCommand }, simpleQuery);
  //   });

  //   afterEach(async () => {
  //     const queryCommand = `DELETE FROM orders_users WHERE user_id = ${user_id}`;
  //     const role = roles.ADMIN_ROLE;
  //     await executeQuery({ db, role, queryCommand }, simpleQuery);
  //   });

  //   it("Should add a new order to the order list", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     const username = "jb";
  //     const password = "secret";
  //     server
  //       .post("/api/v1/login")
  //       .send({ username, password })
  //       .expect(200)
  //       .then(() => {
  //         server
  //           .post(`/api/v1/users/${user_id}/orders`)
  //           .send(body)
  //           .expect(201, done);
  //       });
  //   });

  //   it("Should send 401 when user is not admin", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     const username = "davy000";
  //     const password = "treasure";
  //     server
  //       .post("/api/v1/login")
  //       .send({ username, password })
  //       .expect(200)
  //       .then(() => {
  //         server
  //           .post(`/api/v1/users/${user_id}/orders`)
  //           .send(body)
  //           .expect(401, done);
  //       });
  //   });
  // });
  // describe("PUT/orders", () => {
  //   const id = 1;
  //   const user_id = 3;
  //   const product_id = 3;
  //   const quanttiy = 5;
  //   const newQuantity = 10;
  //   const body = { field: "quantity", value: newQuantity, id, product_id };

  //   afterEach(async () => {
  //     const tableName = tableNames.ORDERS;
  //     const role = roles.ADMIN_ROLE;

  //     const queryCommand = `UPDATE ${tableName} SET quantity = ${quanttiy} WHERE id = ${id} AND product_id = ${product_id};`;

  //     await executeQuery({ db, role, queryCommand }, simpleQuery);
  //   });

  //   it("Should edit an order in the order list", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     const username = "jTest";
  //     const password = "anotherSecret";
  //     server
  //       .post("/api/v1/login")
  //       .send({ username, password })
  //       .expect(200)
  //       .then(() => {
  //         server
  //           .put(`/api/v1/users/${user_id}/orders`)
  //           .send(body)
  //           .expect(200, done);
  //       });
  //   });
  //   it("Should send 401 when user is not admin", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     const username = "davy000";
  //     const password = "treasure";
  //     server
  //       .post("/api/v1/login")
  //       .send({ username, password })
  //       .expect(200)
  //       .then(() => {
  //         server
  //           .put(`/api/v1/users/${user_id}/orders`)
  //           .send(body)
  //           .expect(401, done);
  //       });
  //   });
  //   it("Should send 401 when user is not registered", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     server
  //       .put(`/api/v1/users/${user_id}/orders`)
  //       .send(body)
  //       .expect(401, done);
  //   });
  // });
  // describe("DELETE/orders/", () => {
  //   const id = 1;
  //   const product_id = 3;
  //   const order_id = 1;
  //   const user_id = 3;
  //   const quanttiy = 5;
  //   const transaction_id = 10;

  //   const body = { order_id };

  //   afterEach(async () => {
  //     const role = roles.ADMIN_ROLE;

  //     let tableName = tableNames.ORDERS_USERS;
  //     let queryCommand = `INSERT INTO ${tableName} (order_id, user_id, transaction_id) VALUES(${order_id}, ${user_id}, ${transaction_id});`;

  //     await executeQuery({ db, role, queryCommand }, simpleQuery);

  //     tableName = tableNames.ORDERS;
  //     queryCommand = `INSERT INTO ${tableName}(id, product_id, quantity) VALUES(${id}, ${product_id}, ${quanttiy}) ;`;

  //     await executeQuery({ db, role, queryCommand }, simpleQuery);
  //   });

  //   it("Should delete an order from the product list", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     const username = "jTest";
  //     const password = "anotherSecret";
  //     server
  //       .post("/api/v1/login")
  //       .send({ username, password })
  //       .expect(200)
  //       .then(() => {
  //         server
  //           .delete(`/api/v1/users/${user_id}/orders`)
  //           .send(body)
  //           .expect(204, done);
  //       });
  //   });
  //   it("Should send 401 when user is not admin", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     const username = "davy000";
  //     const password = "treasure";
  //     server
  //       .post("/api/v1/login")
  //       .send({ username, password })
  //       .expect(200)
  //       .then(() => {
  //         server.delete(`/api/v1/users/${user_id}/orders`).expect(401, done);
  //       });
  //   });
  // });

  // describe("POST/checkout", () => {
  //   const user_id = 1; // With this user_id order table will be reset by another test
  //   // const body = {
  //   //   cart: [
  //   //     {
  //   //       user_id,
  //   //       product_id: 3,
  //   //       quantity: 5,
  //   //     },
  //   //   ],
  //   // };

  //   // afterEach(async () => {
  //   //   const queryCommand = `DELETE FROM orders_users WHERE user_id = ${user_id}`;
  //   //   const role = roles.ADMIN_ROLE;
  //   //   await executeQuery({ db, role, queryCommand }, simpleQuery);
  //   // });

  //   it("Should checkout an order", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     const username = "jTest";
  //     const password = "anotherSecret";
  //     const user_id = 3;
  //     server
  //       .post("/api/v1/login")
  //       .send({ username, password })
  //       .expect(200)
  //       .then(() => {
  //         server
  //           .post(`/api/v1/users/${user_id}/cart/checkout`)
  //           // .send(body)
  //           .expect(200)
  //           .end(done);
  //       });
  //   });

  //   // it("Should not checkout an order when no cart provided", (done) => {
  //   //   const server = request.agent(`http://localhost:${process.env.PORT}`);
  //   //   const username = "jb";
  //   //   const password = "secret";
  //   //   // This user doesnt have a cart
  //   //   server
  //   //     .post("/api/v1/login")
  //   //     .send({ username, password })
  //   //     .expect(200)
  //   //     .then(() => {
  //   //       server
  //   //         .post(`/api/v1/users/${user_id}/cart/checkout`)
  //   //         // .send(body)
  //   //         .expect(404)
  //   //         .end(done);
  //   //     });
  //   // });

  //   it("Should send 401 when user is not registered", (done) => {
  //     const server = request.agent(`http://localhost:${process.env.PORT}`);
  //     server
  //       .post(`/api/v1/users/${user_id}/cart/checkout`)
  //       // .send(body)
  //       .expect(401, done);
  //   });
  // });

  describe("GET/cart", () => {
    //* User credentials
    const username = "jTest";
    const password = "anotherSecret";

    it("Should receive a cart ", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      //* Request setup
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.get(`/api/v1/users/cart`).expect(200, done);
        });
    });

    it("Should get nothing when unathorized", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      //* Request setup
      server.get(`/api/v1/users/orders`).expect(401, done);
    });
  });

  describe("POST/cart", () => {
    //* body setup
    const body = {
      product_id: 3,
      quantity: 5,
    };
    //* User credentials
    const username = "jb";
    const password = "secret";

    //* Setup user id
    //? This id does not present in carts table
    const user_id = 1;

    afterEach(async () => {
      //? Delete the newly created record in the db
      const queryCommand = `DELETE FROM ${tableNames.CARTS} WHERE user_id = ${user_id};`;
      await db.query(queryCommand);
    });

    it("Should add a new order to the order list", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Request setup
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.post(`/api/v1/users/cart`).send(body).expect(201, done);
        });
    });

    it("Should send 401 when user is not registered", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);

      //* Request setup
      server.post(`/api/v1/users/cart`).send(body).expect(401, done);
    });
  });
  describe("PUT/cart", () => {
    //* Database record details setup
    //? Both of them permanently present in  the database
    const user_id = 3;
    const product_id = 3;

    //* body setup
    const newQuantity = 10;
    const body = { value: newQuantity, product_id };

    //* User credentials
    const username = "jTest";
    const password = "anotherSecret";

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
    it("Should edit an cart item in the cart list", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Request setup
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.put(`/api/v1/users/cart`).send(body).expect(200, done);
        });
    });

    it("Should send 401 when user is not registered", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Request setup
      server.put(`/api/v1/users/cart`).send(body).expect(401, done);
    });
  });
  describe("DELETE/cart", () => {
    //* Database record details setup
    //? Both of them permanently present in  the database
    const product_id = 3;
    const user_id = 3;
    const quanttiy = 5;

    //* User credentials
    const username = "jTest";
    const password = "anotherSecret";

    //* Body setup
    const body = { product_id };

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

    it("Should delete a cart item from the cart list", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Request setup
      server
        .post("/api/v1/login")
        .send({ username, password })
        .expect(200)
        .then(() => {
          server.delete(`/api/v1/users/cart`).send(body).expect(204, done);
        });
    });
    it("Should send 401 when user is not registered", (done) => {
      //* Initial server setup
      const server = request.agent(`http://localhost:${process.env.PORT}`);
      //* Request setup
      server.delete(`/api/v1/users/cart`).expect(401, done);
    });
  });
});
