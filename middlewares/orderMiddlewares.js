const db = require("../db");
const { tableNames } = require("../config").constants;
const stringCreator = require("../queries/stringCreator");

const fillOrderObject = (arr, index = 0, orderObject = {}) => {
  //* This is my replacement for foreach function

  //* Get the final index of the given array
  const finalIndex = arr.length - 1;

  //* Set up base cases
  if (index > finalIndex) return orderObject;

  if (!arr[0]) return null;

  //* Get the element of the array
  const item = arr[index];
  //? If the orederObject already contains the element's id,
  //? That means that it should only add an element's product to the orderObject[id]
  if (orderObject[item.id])
    orderObject[item.id].products.push({
      name: item.name,
      product_id: item.product_id,
      quantity: item.quantity,
    });
  //? if not, it should create a new object inside the orderObject
  else
    orderObject[item.id] = {
      shipped: item.shipped,
      products: [
        {
          name: item.name,
          product_id: item.product_id,
          quantity: item.quantity,
        },
      ],
    };

  return fillOrderObject(arr, index + 1, orderObject);
};

const getOrdersByUserMiddleware = async (req, res, next) => {
  //* Retrieve user id
  const user_id = req.user.id;

  //* Generate query
  const queryCommand = `SELECT ${tableNames.ORDERS}.id AS id, 
  ${tableNames.ORDERS_USERS}.shipped AS shipped, 
  ${tableNames.PRODUCTS}.name AS name,
    ${tableNames.ORDERS}.product_id AS product_id,
    ${tableNames.ORDERS}.quantity AS quantity
    FROM ${tableNames.ORDERS_USERS}
    JOIN ${tableNames.ORDERS}
    ON ${tableNames.ORDERS}.id = ${tableNames.ORDERS_USERS}.order_id
    JOIN ${tableNames.PRODUCTS}
    ON ${tableNames.PRODUCTS}.id = ${tableNames.ORDERS}.product_id
    WHERE ${tableNames.ORDERS_USERS}.user_id = ${user_id}
    ORDER BY 1 DESC;`;

  try {
    const { rows } = await db.query(queryCommand);

    //* Generate orders object
    //? So it has a format of {[id]: {shipped: true, products:[...]}}
    //? products is an array of objects {name: <String>, product_id: <Number>, quantity: <Number>}
    const orderObject = fillOrderObject(rows);

    if (orderObject) return res.send(orderObject);
  } catch (error) {}
  return res.status(500).send("An error occured, please try again");
};

const postOrderMiddleware = async (req, res, next) => {
  //? Should only proceed if body was supplied and contains transaction id
  if (req.body) {
    //* Retrieve user id and transaction id
    const user_id = req.user.id;
    const transaction_id = req.body.transaction_id;

    if (transaction_id) {
      //? It has to add a new record to order_users table and retrieve a newly generated id
      //? Then it should add all cart items to orders table
      //? And finally it should remove all items from carts table

      //* Generate colums, values to insert and placeholders(queryPrepared)
      //? So it has the format of INSERT INTO(column1,column2...) VALUES($1, $2...) and values are mapped within an array
      const preparedOrdersUsers = stringCreator.orders_users({
        user_id,
        transaction_id,
      });
      //* Generate query
      let queryCommand = `INSERT INTO ${tableNames.ORDERS_USERS}(${preparedOrdersUsers.columns}) VALUES(${preparedOrdersUsers.queryPrepared}) RETURNING *;`;

      try {
        //* Get generated order_id
        const { order_id } = (
          await db.query(queryCommand, preparedOrdersUsers.values)
        ).rows[0];

        //? if order_id was recieved, all cart items could be posted to orders
        if (order_id) {
          //* Get cart items
          queryCommand = `SELECT product_id, quantity FROM ${tableNames.CARTS} WHERE user_id = ${user_id}`;
          const cartItems = (await db.query(queryCommand)).rows;

          //* Insert cart items to orders table
          //? insertedItems should be filled with items insert below
          const insertedItems = [];
          for (const item of cartItems) {
            //* Generate order object
            const orderObject = {
              id: order_id,
              ...item,
            };
            //* Generate colums, values to insert and placeholders(queryPrepared)
            //? So it has the format of INSERT INTO(column1,column2...) VALUES($1, $2...) and values are mapped within an array
            const preparedOrder = stringCreator.orders(orderObject);
            //* Generate query
            queryCommand = `INSERT INTO ${tableNames.ORDERS}(${preparedOrder.columns}) VALUES(${preparedOrder.queryPrepared}) RETURNING *;`;
            //* Inserting
            const insertedItem = (
              await db.query(queryCommand, preparedOrder.values)
            ).rows[0];
            //* Add to insertedItems
            insertedItems.push(insertedItem);
          }
          //* Empty the cart
          //* Generate query
          queryCommand = `DELETE FROM ${tableNames.CARTS} WHERE user_id = ${user_id} RETURNING *;`;
          await db.query(queryCommand);

          //? If all items were successfully posted to orders table, send a confirmation
          if (insertedItems.length === cartItems.length)
            return res.status(201).send("Your order has been placed");
        }
      } catch (error) {}
    }
  }
  return res.status(400).send("Check your cart");
};

/**
 *  Possibilities to change a quantity
 */
// const putOrderMiddleware = async (req, res, next) => {
//   const body = req.body;

//   if (body) {
//     const columnName = body.field;
//     const newValue = body.value;
//     const id = body.id;
//     const product_id = body.product_id;

//     if (columnName && newValue && id && product_id) {
//       const role = roles.ADMIN_ROLE;
//       const tableName = tableNames.ORDERS;

//       const updated = await executeQuery(
//         { db, role, tableName, columnName, newValue, id, product_id },
//         updateValuesByIdAndProductId
//       );

//       if (updated) return res.send("Updated");
//     }
//   }

//   return res.status(400).send("Cannot be updated");
// };
// const deleteOrderMiddleware = async (req, res, next) => {
//   if (req.body) {
//     const order_id = req.body.order_id;
//     if (order_id) {
//       const role = roles.ADMIN_ROLE;
//       const tableName = tableNames.ORDERS_USERS;

//       const deleted = await executeQuery(
//         { db, tableName, role, order_id },
//         deleteValuesByOrderId
//       );
//       if (deleted) return res.status(204).send("Successfully deleted");
//     }
//   }
//   return res.status(400).send("The operation cannot be done");
// };

module.exports = {
  getOrdersByUserMiddleware,
  postOrderMiddleware,
  // putOrderMiddleware,
  // deleteOrderMiddleware,
};
