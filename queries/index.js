/** executeQuery description
 * @param {Object} options
 * @param {String} options.tableName The name of the table
 * @param {Number} options.id id column
 * @param {Number} options.order_id order_id column
 * @param {Number} options.product_id order_id column
 * @param {Number} options.user_id user_id column
 * @param {Object} options.db Database object
 * @param {String} options.username username column
 * @param {String} options.password password column
 * @param {String} options.category category column of products table
 * @param {String} options.role Role public|registerd|admin
 * @param {String} options.columns Columns to insert into
 * @param {String} options.columnName The name of the column to be updated
 * @param {String} options.path Path to the file with values
 * @param {String} options.values Values to be inserted
 * @param {String} options.newValue The new value that updates previous one
 * @param {String} options.queryCommand Use only for testing purposes
 * @param {String} options.queryPrepared String with $1..
 * @param {Function} queryCallback Query function
 */

const executeQuery = async (options, queryCallback = async () => {}) => {
  // options should always contain at least db and role property
  await options.db.query("SET ROLE " + options.role + ";");
  const queryResult = await queryCallback(options);
  await options.db.query("SET SESSION AUTHORIZATION DEFAULT;");
  await options.db.query("DISCARD SEQUENCES;");
  //await options.db.query("DISCARD ALL;");
  return queryResult;
};

const simpleQuery = async ({ db, queryCommand }) => {
  try {
    const executed = await db.query(queryCommand);
    if (executed) if (executed.rows) return executed.rows;
  } catch (error) {
    //console.error(error);
  }
};

/*
 * Could be used for selecting a user, product
 */
const selectById = async ({ db, tableName, id }) => {
  const params = [id];
  const query = "SELECT * FROM " + tableName + " WHERE id = $1;";

  try {
    const { rows } = await db.query(query, params);
    return rows[0];
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

/*
 * Could be used for updating rows
 * Should be used only when id is PRIMARY KEY or UNIQUE
 */
const updateValuesById = async ({
  db,
  tableName,
  id,
  newValue,
  columnName,
}) => {
  const params = [newValue, id];
  const query =
    "UPDATE " +
    tableName +
    " SET " +
    columnName +
    " = $1 WHERE id = $2 RETURNING *;";

  try {
    const { rows } = await db.query(query, params);
    return rows[0];
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

/*
 * Could be used for updating orders table
 */
const updateValuesByIdAndProductId = async ({
  db,
  tableName,
  id,
  product_id,
  newValue,
  columnName,
}) => {
  const params = [newValue, id, product_id];
  const query = `UPDATE ${tableName} SET ${columnName} = $1 WHERE id = $2 AND product_id = $3 RETURNING *;`;

  try {
    const { rows } = await db.query(query, params);
    return rows[0];
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

const updateValuesByUserIdAndProductId = async ({
  db,
  tableName,
  user_id,
  product_id,
  newValue,
  columnName,
}) => {
  const params = [newValue, user_id, product_id];
  const query = `UPDATE ${tableName} SET ${columnName} = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *;`;

  try {
    const { rows } = await db.query(query, params);
    return rows[0];
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

/*
 * Could be used for deleting rows
 */
const deleteValuesById = async ({ db, tableName, id }) => {
  const params = [id];
  const query = "DELETE FROM " + tableName + " WHERE id = $1;";
  try {
    await db.query(query, params);
    return { success: true };
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

/*
 * Could be used for deleting rows in orders table
 */
const deleteValuesByOrderId = async ({ db, tableName, order_id }) => {
  const params = [order_id];
  const query = "DELETE FROM " + tableName + " WHERE order_id = $1;";
  try {
    await db.query(query, params);
    return { success: true };
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

/*
 * Could be used for deleting rows in carts table
 */
const deleteValuesByUserIdAndProductId = async ({
  db,
  tableName,
  user_id,
  product_id,
}) => {
  const params = [user_id, product_id];
  const query =
    "DELETE FROM " + tableName + " WHERE user_id = $1 AND product_id = $2;";
  try {
    await db.query(query, params);
    return { success: true };
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

/*
 * Could be used for selecting a user, product or order
 */
const selectByUsername = async ({ db, tableName, username }) => {
  const params = [username];
  const query = "SELECT * FROM " + tableName + " WHERE username = $1;";

  try {
    const { rows } = await db.query(query, params);
    return rows[0];
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

/**
 * Could be used on products table
 */
const selectByCategory = async ({ db, tableName, category }) => {
  const params = [category];
  const query = `SELECT * from ${tableName} WHERE category = $1;`;

  try {
    const { rows } = await db.query(query, params);
    if (!rows[0]) return undefined;
    return rows;
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

const insertValues = async ({
  db,
  tableName,
  columns,
  values,
  queryPrepared,
}) => {
  const query = `INSERT INTO ${tableName}(${columns}) VALUES(${queryPrepared}) RETURNING *;`;

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

/*
 * Could be used for selecting products or orders
 */
const selectByTableName = async ({ db, tableName }) => {
  const query = "SELECT * FROM " + tableName + ";";

  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

/*
 * Could be used for authorisation
 */
const selectWithUsernameAndPassword = async ({
  db,
  tableName,
  username,
  password,
}) => {
  const params = [username, password];
  const query =
    "SELECT * FROM " + tableName + " WHERE username = $1 AND password = $2;";

  try {
    const { rows } = await db.query(query, params);

    if (rows[0])
      return {
        id: rows[0].id,
        is_admin: rows[0].is_admin,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        email: rows[0].email,
        username: rows[0].username,
      };
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

/*
 * Could be used for selecting an order
 */
const selectByIdMultiple = async ({ db, tableName, id }) => {
  const params = [id];
  const query = `SELECT * FROM ${tableName} WHERE id = $1;`;
  try {
    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

/*
 * Could be used for selecting an order_id from carts or orders_users
 */
const selectByUserId = async ({ db, tableName, user_id }) => {
  const params = [user_id];
  const query = `SELECT * FROM ${tableName} WHERE user_id = $1;`;
  try {
    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

/*
 * Orders tables have more complex structure and require their own query
 */
const selectOrdersByUserId = async ({ db, user_id }) => {
  const params = [user_id];
  const query = `SELECT orders.id AS id, 
  orders_users.shipped AS shipped, 
  products.name AS name,
  orders.product_id AS product_id,
  orders.quantity AS quantity
  FROM orders_users
  JOIN orders
  ON orders.id = orders_users.order_id
  JOIN products
  ON products.id = orders.product_id
  WHERE orders_users.user_id = $1
  ORDER BY 1 DESC;`;
  try {
    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error(error.message);
  }
  return undefined;
};

const createTempTable = async ({ db, tableName }) => {
  try {
    await db.query(
      "CREATE TEMPORARY TABLE " +
        tableName +
        " (LIKE " +
        tableName +
        " INCLUDING ALL);"
    );
    // await db.query(
    //   "ALTER SEQUENCE IF EXISTS user_id_seq RESTART WITH 100;"
    // );
    // await db.query(
    //   "ALTER SEQUENCE IF EXISTS product_id_seq RESTART WITH 100;"
    // );
  } catch (error) {
    console.error(error);
  }
};

const dropTable = async ({ db, tableName }) => {
  try {
    await db.query("DROP TABLE IF EXISTS " + tableName + ";");
    await db.query("DISCARD TEMP;");
  } catch (error) {
    console.error(error);
  }
};

const populateTable = async ({ db, tableName, columns, path }) => {
  try {
    await db.query(
      "COPY " +
        tableName +
        "(" +
        columns +
        ") FROM '" +
        path +
        "' DELIMITER ',' CSV HEADER;"
    );
  } catch (error) {
    console.error(error);
  }
};

//TODO: selectByOrderId
//TODO: selectByUserId
module.exports = {
  selectById,
  selectByIdMultiple,
  selectByUsername,
  selectByUserId,
  selectOrdersByUserId,
  selectByTableName,
  selectByCategory,
  selectWithUsernameAndPassword,
  updateValuesById,
  updateValuesByIdAndProductId,
  updateValuesByUserIdAndProductId,
  deleteValuesById,
  deleteValuesByOrderId,
  deleteValuesByUserIdAndProductId,
  executeQuery,
  createTempTable,
  dropTable,
  populateTable,
  insertValues,
  simpleQuery,
};
