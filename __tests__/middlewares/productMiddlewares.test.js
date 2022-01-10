const { assert } = require("chai");
const db = require("../../db");
const { tableNames } = require("../../config").constants;

const {
  getProductsMiddleware,
  postProductMiddleware,
  putProductMiddleware,
  deleteProductMiddleware,
} = require("../../middlewares/productMiddlewares");

describe("Product middlewares", () => {
  //? Mocking next function
  const next = () => {
    nextUsed = true;
  };

  //? Mocking res object
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

  describe("productMiddlewares", () => {
    describe("getProductsMiddleware", () => {
      it("Should send back a list of all products", async () => {
        //* req mock function setup
        const req = {};

        await getProductsMiddleware(req, res, next);

        assert.isArray(sendUsed);
        assert.isObject(sendUsed[0]);
      });
    });

    describe("postProductMiddleware", () => {
      //? New values to be iserted
      const name = "La cream";
      const description = "Cares of your skin";
      const price = 1;
      const category = "health";
      const preview = "www";

      afterEach(async () => {
        //? Delete the newly created record in the db
        const tableName = tableNames.PRODUCTS;
        const queryCommand = `DELETE FROM ${tableName} WHERE name = '${name}' AND description = '${description}';`;
        await db.query(queryCommand);
      });

      it("Should add a new product", async () => {
        //* req mock function setup
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
        //? It return status 201 and the newly created product
        assert.strictEqual(sendUsed.split(" ")[0], "201");
      });
      it("Should send back 400 Check your input", async () => {
        //* req mock function setup
        //? The category is not provided here
        const body = {
          name,
          description,
          price,
          //! category,
          preview,
        };
        const req = { body };

        await postProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 Check your input");
      });
    });

    describe("putProductMiddleware", () => {
      let selected;
      const tableName = tableNames.PRODUCTS;
      const id = 1;

      beforeEach(async () => {
        //? Retrieve the object of the product
        //? This will be used for resetting of the product in afterEach
        selected = (
          await db.query(`SELECT * FROM ${tableName} WHERE id = ${id};`)
        ).rows[0];
      });

      afterEach(async () => {
        //? Reset recently updated product
        //? Execute update that will reset the query to its original values
        const queryCommand = `UPDATE ${tableName} SET (name, description, price, category, preview) = ('${selected.name}', '${selected.description}', '${selected.price}', '${selected.category}', '${selected.preview}') WHERE id = ${id};`;
        await db.query(queryCommand);
      });

      it("Should update a product's name", async () => {
        //? The new name that replaces the original one
        const newName = "Avocado cream";

        //* req mock function setup
        const req = {
          body: { field: "name", value: newName },
          params: { id: 1 },
        };

        await putProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "Updated");
      });
      it("Should return '400 Cannot be updated' when no name provided", async () => {
        //? The new name that replaces the original one
        const newName = "Avocado cream";

        //* req mock function setup
        const req = {
          body: { field: "name", value: null },
          params: { id: 1 },
        };

        await putProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 Cannot be updated");
      });
    });

    describe("deleteProductMiddleware", () => {
      let selected;
      const tableName = tableNames.PRODUCTS;
      const id = 1;

      beforeEach(async () => {
        //? Retrieve the object of the product
        //? This will be used for resetting of the product in afterEach
        selected = (
          await db.query(`SELECT * FROM ${tableName} WHERE id = ${id};`)
        ).rows[0];
      });

      afterEach(async () => {
        //? This query should restore the original object
        //? Trycatch block should be here because the last test won't delete the product,
        //? so it will throw an error that this inserting violates primary key, because of the same id
        try {
          const queryCommand = `INSERT INTO ${tableName} VALUES (${id}, '${selected.name}', '${selected.description}', ${selected.price}, '${selected.category}','${selected.preview}');`;
          await db.query(queryCommand);
        } catch (error) {}
      });

      it("Should delete a product", async () => {
        //* req mock function setup
        const req = {
          params: { id },
        };
        //? Call to the delete product middleware
        await deleteProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "204 Successfully deleted");
      });

      it("Should return '400 The operation cannot be done' if id is not provided", async () => {
        //* req mock function setup
        const req = {
          params: { id: undefined },
        };

        //? Call to the delete product middleware
        await deleteProductMiddleware(req, res, next);

        assert.strictEqual(nextUsed, false);
        assert.strictEqual(sendUsed, "400 The operation cannot be done");
      });
    });
  });
});
