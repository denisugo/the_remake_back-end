const db = require("../db");
const { tableNames, roles } = require("../config").constants;
const stringCreator = require("../queries/stringCreator");
const {
  executeQuery,
  selectByUserId,
  insertValues,
  updateValuesByUserIdAndProductId,
  deleteValuesByUserIdAndProductId,
  selectById,
} = require("../queries");
const { asyncMap } = require("../utils/asyncFunc");

const tableName = tableNames.CARTS;

const getCartByUserMiddleware = async (req, res, nex) => {
  //* Retrieve user id
  const user_id = req.user.id;

  //* Generate a query command
  const queryCommand = `SELECT ${tableNames.CARTS}.user_id AS user_id, 
  ${tableNames.CARTS}.product_id AS product_id, 
  ${tableNames.CARTS}.quantity AS quantity, 
  ${tableNames.PRODUCTS}.name AS name, 
  ${tableNames.PRODUCTS}.price AS price, 
  ${tableNames.PRODUCTS}.preview AS preview
  FROM carts
  JOIN products
  ON ${tableNames.CARTS}.product_id = ${tableNames.PRODUCTS}.id
  WHERE carts.user_id = ${user_id};`;

  try {
    //* Retrieve a cart from database
    const { rows } = await db.query(queryCommand);

    //? rows is always an array, so empty array is also an allowed value
    return res.send(rows);
  } catch (error) {}

  //* Send status code 500 if an unexpected error occured
  return res.status(500).send("");
};

const postCartMiddleware = async (req, res, nex) => {
  //* Retrieve a user_id and body from req
  const user_id = req.user.id;
  const body = req.body;

  //? Should only proceed if body exists and contains product id and quatity
  if (body) {
    if (body.product_id && body.quantity) {
      //* Add user_id to body object, so it is now a cart object
      body.user_id = user_id;

      //? Generate colums, values to insert and placeholders(queryPrepared)
      //? So it has the format of INSERT INTO(column1,column2...) VALUES($1, $2...) and values are mapped within an array
      const { values, columns, queryPrepared } = stringCreator.cart(body);

      const queryCommand = `INSERT INTO ${tableNames.CARTS}(${columns}) VALUES(${queryPrepared}) RETURNING *;`;
      try {
        const { rows } = await db.query(queryCommand, values);
        //? if item was add send a confirmation
        if (rows[0]) return res.status(201).send("Added to the cart");
      } catch (error) {}
    }
  }

  return res.status(400).send("Check your cart");
};

const putCartMiddleware = async (req, res, nex) => {
  //? This middleware only allows to update a quantity

  //* Retrieve a user_id and body from req
  const user_id = req.user.id;
  const body = req.body;

  //? Should only proceed if body exists and contains product id
  if (body) {
    const newValue = body.value;
    const columnName = "quantity";
    const product_id = body.product_id;
    //? Should only proceed if both field and value were supplied
    if (newValue && product_id) {
      try {
        //? product_id and newValue should be passed as an array because user can manually change them
        //? Rows is always an array, so the first value only should be taken
        const { rows } = await db.query(
          `UPDATE ${tableNames.CARTS} SET ${columnName} = $1 WHERE user_id = ${user_id} AND product_id = $2 RETURNING *;`,
          [newValue, product_id]
        );

        //? if item was updated send a confirmation
        if (rows[0]) return res.send("Updated");
      } catch (error) {}
    }
  }
  return res.status(400).send("Cannot be updated");
};

const deleteCartMiddleware = async (req, res, nex) => {
  //* Retrieve a user_id and body from req
  const user_id = req.user.id;
  const body = req.body;

  //? Should only proceed if body exists and contains product id
  if (body) {
    const product_id = body.product_id;
    if (product_id) {
      try {
        //? product_id should be passed as an array because user can manually change them
        //? Rows is always an array, so the first value only should be taken
        const { rows } = await db.query(
          `DELETE FROM ${tableNames.CARTS} WHERE user_id = ${user_id} AND product_id = $1 RETURNING *;`,
          [product_id]
        );

        //? if item was deleted send a confirmation
        if (rows[0]) return res.status(204).send("Successfully deleted");
      } catch (error) {}
    }
  }
  return res.status(400).send("The operation cannot be done");
};

module.exports = {
  getCartByUserMiddleware,
  postCartMiddleware,
  putCartMiddleware,
  deleteCartMiddleware,
};
