const {
  executeQuery,
  selectByCategory,
  selectByTableName,
  selectById,
  insertValues,
  updateValuesById,
  deleteValuesById,
} = require("../queries");
const db = require("../db");
const { tableNames, roles } = require("../config").constants;
const stringCreator = require("../queries/stringCreator");

const tableName = tableNames.PRODUCTS;

const getProductsMiddleware = async (req, res, next) => {
  //? Get products should send back a list with all available products
  const { rows } = await db.query(`SELECT * FROM ${tableNames.PRODUCTS};`);
  if (rows) return res.send(rows);
  return res.status(500).send("");
};

const postProductMiddleware = async (req, res, next) => {
  //? Check if all parameters were supplied
  if (req.body) {
    if (
      req.body.name &&
      req.body.description &&
      req.body.price &&
      req.body.category &&
      req.body.preview
    ) {
      //? Generate colums, values to insert and placeholders(queryPrepared)
      //? So it has the format of INSERT INTO(column1,column2...) VALUES($1, $2...) and values are mapped within an array
      const { columns, values, queryPrepared } = stringCreator.products(
        req.body
      );
      const queryCommand = `INSERT INTO ${tableNames.PRODUCTS}(${columns}) VALUES(${queryPrepared}) RETURNING *;`;

      //? Retrieve the newly created product
      const { rows } = await db.query(queryCommand, values);
      if (rows[0]) {
        return res.status(201).send(rows[0]);
      }
    }
  }
  return res.status(400).send("Check your input");
};

const putProductMiddleware = async (req, res, next) => {
  //? Getting the id of the product
  const id = req.params.id;

  //? It should only proceed if body and id were supplied
  if (req.body && id) {
    if (req.body.field && req.body.value) {
      const columnName = req.body.field;
      const newValue = req.body.value;

      //? Getting verification that the new value was set,
      //? If so, send back status 200
      const { rows } = await db.query(
        `UPDATE ${tableNames.PRODUCTS} SET ${columnName} = $1 WHERE id = $2 RETURNING *;`,
        [newValue, id]
      );
      if (rows[0]) return res.send("Updated");
    }
  }
  //? Handle error
  return res.status(400).send("Cannot be updated");
};

const deleteProductMiddleware = async (req, res, next) => {
  //? Getting the id of the product
  const id = req.params.id;

  //? It should only proceed if id was supplied
  if (id) {
    //? Getting verification that the new value was removed,
    //? If so, send back status 202
    //? An additional measure should be applied here. Id should passsed as
    //? an array. It is very important because a user can edit the value of
    //? the id manually.

    const { rows } = await db.query(
      `DELETE FROM ${tableNames.PRODUCTS} WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (rows[0]) return res.status(204).send("Successfully deleted");
  }
  //* Error handler
  return res.status(400).send("The operation cannot be done");
};

module.exports = {
  getProductsMiddleware,
  postProductMiddleware,
  putProductMiddleware,
  deleteProductMiddleware,
};
