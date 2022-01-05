// const { assert } = require("chai");
// const db = require("../db");
// const {
//   selectById,
//   selectByTableName,
//   selectWithUsernameAndPassword,
//   selectByCategory,
//   executeQuery,
//   createTempTable,
//   dropTable,
//   populateTable,
//   insertValues,
//   updateValuesById,
//   simpleQuery,
//   deleteValuesById,
//   deleteValuesByOrderId,
//   selectByIdMultiple,
//   selectByUserId,
//   selectOrdersByUserId,
//   updateValuesByIdAndProductId,
//   updateValuesByUserIdAndProductId,
//   deleteValuesByUserIdAndProductId,
// } = require("../queries");

// const stringCreator = require("../queries/stringCreator");

// const { roles, tableNames } = require("../config").constants;

// describe("Queries", () => {
//   describe("Public role", () => {
//     describe("Products table", () => {
//       beforeEach("Create temporary table products", async function () {
//         await executeQuery(
//           { db, role: roles.PUBLIC_ROLE, tableName: tableNames.PRODUCTS },
//           createTempTable
//         );
//         await executeQuery(
//           {
//             db,
//             role: roles.PUBLIC_ROLE,
//             tableName: tableNames.PG_TEMP_PRODUCTS,
//             columns: "id,name,description,price,category,preview",
//             path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/products.csv",
//           },
//           populateTable
//         );
//       });

//       afterEach("Drop temporary table products", async function () {
//         await executeQuery(
//           {
//             db,
//             role: roles.PUBLIC_ROLE,
//             tableName: tableNames.PG_TEMP_PRODUCTS,
//           },
//           dropTable
//         );
//       });

//       describe("selectByTableName", () => {
//         it("Should return array with products", async () => {
//           const tableName = tableNames.PG_TEMP_PRODUCTS;

//           // const output = await selectByTableName(db, tableName);
//           const output = await executeQuery(
//             { db, tableName, role: roles.PUBLIC_ROLE },
//             selectByTableName
//           );

//           assert.isArray(output);
//           assert.isObject(output[1]);
//           assert.strictEqual(output.length, 20);
//         });

//         it("Should return undefined if the table name is wrong", async () => {
//           const tableName = "wrong_name";

//           // const output = await selectByTableName(db, tableName);
//           const output = await executeQuery(
//             { db, tableName, role: roles.PUBLIC_ROLE },
//             selectByTableName
//           );

//           assert.isUndefined(output);
//         });
//       });

//       describe("selectByCategory", () => {
//         it("Should return array with products", async () => {
//           const tableName = tableNames.PG_TEMP_PRODUCTS;
//           const role = roles.PUBLIC_ROLE;
//           const category = "The Kroger Co.";

//           const output = await executeQuery(
//             { db, tableName, role, category },
//             selectByCategory
//           );

//           assert.isArray(output);
//           assert.isObject(output[0]);
//         });

//         it("Should return undefined if the category is wrong", async () => {
//           const tableName = tableNames.PG_TEMP_PRODUCTS;
//           const role = roles.PUBLIC_ROLE;
//           const category = "Wrong___name";

//           // const output = await selectByTableName(db, tableName);
//           const output = await executeQuery(
//             { db, tableName, role, category },
//             selectByCategory
//           );

//           assert.isUndefined(output);
//         });
//       });
//     });

//     describe("Users table", () => {
//       beforeEach("Create temporary table users", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.USERS },
//           createTempTable
//         );
//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             tableName: tableNames.PG_TEMP_USERS,
//             columns:
//               "id, first_name, last_name, email, username, is_admin, password",
//             path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/users.csv",
//           },
//           populateTable
//         );

//         // setup

//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             queryCommand:
//               "GRANT SELECT, INSERT(first_name,last_name,email,username,password) ON " +
//               tableNames.PG_TEMP_USERS +
//               " TO " +
//               roles.PUBLIC_ROLE +
//               "; GRANT USAGE ON ALL SEQUENCES IN SCHEMA pg_temp TO " +
//               roles.PUBLIC_ROLE +
//               ";",
//           },
//           simpleQuery
//         );
//       });

//       afterEach("Drop temporary table users", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.PG_TEMP_USERS },
//           dropTable
//         );
//       });

//       describe("insertValues", () => {
//         it("Should insert new record to users table", async () => {
//           const tableName = tableNames.PG_TEMP_USERS;

//           const model = {
//             first_name: "Robbie",
//             last_name: "Jackson",
//             email: "rj0@tmall.com",
//             username: "robinnho000",
//             password: "fal",
//           };

//           const { values, columns, queryPrepared } = stringCreator.users(model);

//           const output = await executeQuery(
//             {
//               db,
//               tableName,
//               role: roles.PUBLIC_ROLE,
//               columns,
//               values,
//               queryPrepared,
//             },
//             insertValues
//           );
//           assert.isObject(output);
//         });
//         it("Should return undefined when input is incorrect", async () => {
//           const tableName = tableNames.PG_TEMP_USERS;

//           const model = {
//             first_name: "911",
//             last_name: "Jackson",
//             email: "rj0@tmall.com",
//             username: "rmarczyk1", //incorrect value
//             password: "nul",
//           };
//           const { values, columns, queryPrepared } = stringCreator.users(model);

//           const output = await executeQuery(
//             {
//               db,
//               tableName,
//               role: roles.PUBLIC_ROLE,
//               columns,
//               values,
//               queryPrepared,
//             },
//             insertValues
//           );
//           assert.isUndefined(output);
//         });
//       });

//       describe("selectUsernameWithPassword", () => {
//         it("Should select user with username and password", async () => {
//           const tableName = tableNames.PG_TEMP_USERS;

//           const role = roles.PUBLIC_ROLE;

//           const username = "ccaltun0";
//           const password = "m5FS8yMIy6";

//           const output = await executeQuery(
//             { db, tableName, role, username, password },
//             selectWithUsernameAndPassword
//           );

//           assert.isObject(output);
//           assert.strictEqual(typeof output.is_admin, "boolean");
//           assert.strictEqual(typeof output.id, "number");
//           assert.strictEqual(typeof output.username, "string");
//           assert.strictEqual(typeof output.first_name, "string");
//           assert.strictEqual(typeof output.last_name, "string");
//           assert.strictEqual(typeof output.email, "string");
//         });

//         it("Should return undefined when password is incorrect", async () => {
//           const tableName = tableNames.PG_TEMP_USERS;

//           const role = roles.PUBLIC_ROLE;

//           const username = "ccaltun0";
//           const password = "incorrect";

//           const output = await executeQuery(
//             { db, tableName, role, username, password },
//             selectWithUsernameAndPassword
//           );

//           assert.isUndefined(output);
//         });

//         it("Should return undefined when both password and username are incorrect", async () => {
//           const tableName = tableNames.PG_TEMP_USERS;

//           const role = roles.PUBLIC_ROLE;

//           const username = "ccaltun";
//           const password = "incorrect";

//           const output = await executeQuery(
//             { db, tableName, role, username, password },
//             selectWithUsernameAndPassword
//           );

//           assert.isUndefined(output);
//         });
//       });
//     });
//   });

//   describe("Registered role", () => {
//     describe("Users table", () => {
//       beforeEach("Create temporary table users", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.USERS },
//           createTempTable
//         );
//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             tableName: tableNames.PG_TEMP_USERS,
//             columns:
//               "id, first_name, last_name, email, username, is_admin, password",
//             path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/users.csv",
//           },
//           populateTable
//         );

//         // setup

//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             queryCommand:
//               "GRANT SELECT,UPDATE(first_name,last_name,email,username,password) ON " +
//               tableNames.PG_TEMP_USERS +
//               " TO " +
//               roles.REGISTERED_ROLE +
//               ";",
//           },
//           simpleQuery
//         );
//       });

//       afterEach("Drop temporary table users", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.PG_TEMP_USERS },
//           dropTable
//         );
//       });

//       describe("selectById", () => {
//         it("Should select a user by id", async () => {
//           const id = 1;

//           const tableName = tableNames.PG_TEMP_USERS;

//           const output = await executeQuery(
//             { db, tableName, id, role: roles.REGISTERED_ROLE },
//             selectById
//           );
//           assert.isObject(output);
//         });

//         it("Should return undefined if id doesnt exist", async () => {
//           const id = 300;
//           const tableName = tableNames.PG_TEMP_USERS;

//           const output = await executeQuery(
//             { db, tableName, id, role: roles.REGISTERED_ROLE },
//             selectById
//           );

//           assert.isUndefined(output);
//         });

//         it("Should return undefined if sql injection happened", async () => {
//           const id = "';--";
//           const tableName = tableNames.PG_TEMP_USERS;

//           let output = await selectById({ db, tableName, id });

//           assert.isUndefined(output);
//         });
//       });

//       describe("updateValuesById", () => {
//         it("Updates values filtered by id", async () => {
//           const columnName = "first_name";
//           const newValue = "Jessica";
//           const id = 1;
//           const tableName = tableNames.PG_TEMP_USERS;

//           const output = await executeQuery(
//             {
//               db,
//               tableName,
//               role: roles.REGISTERED_ROLE,
//               columnName,
//               newValue,
//               id,
//             },
//             updateValuesById
//           );

//           assert.isObject(output);
//         });

//         it("Returns undefined when the new value is incorrect", async () => {
//           const columnName = "username";
//           const newValue = "rmarczyk1";
//           const id = 1;
//           const tableName = tableNames.PG_TEMP_USERS;

//           const output = await executeQuery(
//             {
//               db,
//               tableName,
//               role: roles.REGISTERED_ROLE,
//               columnName,
//               newValue,
//               id,
//             },
//             updateValuesById
//           );

//           assert.isUndefined(output);
//         });

//         it("Returns undefined when trying to update is_admin", async () => {
//           const columnName = "is_admin";
//           const newValue = true;
//           const id = 1;
//           const tableName = tableNames.PG_TEMP_USERS;

//           const output = await executeQuery(
//             {
//               db,
//               tableName,
//               role: roles.REGISTERED_ROLE,
//               columnName,
//               newValue,
//               id,
//             },
//             updateValuesById
//           );

//           assert.isUndefined(output);
//         });
//       });
//     });

//     describe("Carts table", () => {
//       beforeEach("Create temporary table cart", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.CARTS },
//           createTempTable
//         );
//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             tableName: tableNames.PG_TEMP_CARTS,
//             columns: "user_id, product_id, quantity",
//             path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/carts.csv",
//           },
//           populateTable
//         );

//         // setup

//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             queryCommand: `GRANT SELECT, INSERT, UPDATE, DELETE ON ${tableNames.PG_TEMP_CARTS} TO ${roles.REGISTERED_ROLE};`,
//           },
//           simpleQuery
//         );
//       });

//       afterEach("Drop temporary table orders", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.PG_TEMP_CARTS },
//           dropTable
//         );
//       });

//       const tableName = tableNames.PG_TEMP_CARTS;
//       const role = roles.REGISTERED_ROLE;
//       describe("selectByUserId", () => {
//         it("Should select all cart items by user_id", async () => {
//           const user_id = 8;

//           const selected = await executeQuery(
//             { db, tableName, role, user_id },
//             selectByUserId
//           );

//           assert.isArray(selected);
//           assert.isObject(selected[0]);
//         });
//       });

//       describe("insertValues", () => {
//         it("Should insert a new item", async () => {
//           const user_id = 1;
//           const product_id = 1;
//           const quantity = 3;
//           const cartObject = { user_id, product_id, quantity };

//           const { columns, values, queryPrepared } =
//             stringCreator.cart(cartObject);

//           const inserted = await executeQuery(
//             { db, tableName, role, columns, values, queryPrepared },
//             insertValues
//           );

//           assert.isObject(inserted);
//         });

//         it("Should not insert a new item when PK is violated", async () => {
//           const user_id = 7;
//           const product_id = 6;
//           const quantity = 3;
//           const cartObject = { user_id, product_id, quantity };

//           const { columns, values, queryPrepared } =
//             stringCreator.cart(cartObject);

//           const inserted = await executeQuery(
//             { db, tableName, role, columns, values, queryPrepared },
//             insertValues
//           );

//           assert.isUndefined(inserted);
//         });
//       });

//       describe("updateValuesByUserIdAndProductId", () => {
//         it("Should insert a new item", async () => {
//           const user_id = 8;
//           const product_id = 16;
//           const newValue = 3;
//           const columnName = "quantity";

//           const updated = await executeQuery(
//             {
//               db,
//               tableName,
//               role,
//               columnName,
//               newValue,
//               user_id,
//               product_id,
//             },
//             updateValuesByUserIdAndProductId
//           );
//           assert.isObject(updated);
//         });
//         it("Should not update when user does not exist", async () => {
//           const user_id = 115;
//           const product_id = 16;
//           const newValue = 3;
//           const columnName = "quantity";

//           const updated = await executeQuery(
//             {
//               db,
//               tableName,
//               role,
//               columnName,
//               newValue,
//               user_id,
//               product_id,
//             },
//             updateValuesByUserIdAndProductId
//           );
//           assert.isUndefined(updated);
//         });
//       });

//       describe("deleteValuesByUserIdAndProductId", () => {
//         it("Should delete an item", async () => {
//           const user_id = 8;
//           const product_id = 16;

//           const deleted = await executeQuery(
//             {
//               db,
//               tableName,
//               role,
//               user_id,
//               product_id,
//             },
//             deleteValuesByUserIdAndProductId
//           );
//           assert.isObject(deleted);
//         });
//       });
//     });

//     describe("Orders table", () => {
//       beforeEach("Create temporary table orders", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.ORDERS },
//           createTempTable
//         );
//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             tableName: tableNames.PG_TEMP_ORDERS,
//             columns: "id, product_id, quantity",
//             path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/orders.csv",
//           },
//           populateTable
//         );

//         // setup

//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             queryCommand: `GRANT SELECT,INSERT ON ${tableNames.PG_TEMP_ORDERS} TO ${roles.REGISTERED_ROLE};`,
//           },
//           simpleQuery
//         );
//       });

//       afterEach("Drop temporary table orders", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.PG_TEMP_ORDERS },
//           dropTable
//         );
//       });

//       beforeEach("Create temporary table orders_users", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.ORDERS_USERS },
//           createTempTable
//         );
//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             tableName: tableNames.PG_TEMP_ORDERS_USERS,
//             columns: "order_id, user_id, shipped, transaction_id",
//             path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/orders_users.csv",
//           },
//           populateTable
//         );

//         // setup

//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             queryCommand: `GRANT SELECT,INSERT ON ${tableNames.PG_TEMP_ORDERS_USERS} TO ${roles.REGISTERED_ROLE};`,
//           },
//           simpleQuery
//         );
//       });

//       afterEach("Drop temporary table orders_users", async function () {
//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             tableName: tableNames.PG_TEMP_ORDERS_USERS,
//           },
//           dropTable
//         );
//       });

//       describe("insertValues", () => {
//         const tableName = tableNames.PG_TEMP_ORDERS;
//         const role = roles.REGISTERED_ROLE;

//         it("Should insert values", async () => {
//           const orderObject = {
//             id: 100,
//             product_id: 12,
//             quantity: 2,
//           };

//           const { columns, queryPrepared, values } =
//             stringCreator.orders(orderObject);

//           const inserted = await executeQuery(
//             { db, tableName, role, columns, queryPrepared, values },
//             insertValues
//           );

//           assert.isObject(inserted);
//         });

//         it("Should not insert values if it violates PK", async () => {
//           const orderObject = {
//             id: 5,
//             product_id: 16,
//             quantity: 2,
//           }; // values are from temp table data

//           const { columns, queryPrepared, values } =
//             stringCreator.orders(orderObject);

//           const inserted = await executeQuery(
//             { db, tableName, role, columns, queryPrepared, values },
//             insertValues
//           );

//           assert.isUndefined(inserted);
//         });
//       });

//       describe("selectOrdersByUserId", () => {
//         // Interacts with real db
//         const role = roles.REGISTERED_ROLE;
//         it("Should select all order items by user_id", async () => {
//           const user_id = 1;

//           const selected = await executeQuery(
//             { db, role, user_id },
//             selectOrdersByUserId
//           );

//           assert.isArray(selected);
//           assert.isObject(selected[0]);
//         });

//         it("Should return empty array when id doesnt exist", async () => {
//           const user_id = 1000;

//           const selected = await executeQuery(
//             { db, role, user_id },
//             selectOrdersByUserId
//           );

//           assert.isArray(selected);
//           assert.isUndefined(selected[0]);
//         });
//       });

//       describe("selectByIdMultiple", () => {
//         const tableName = tableNames.PG_TEMP_ORDERS;
//         const role = roles.REGISTERED_ROLE;
//         it("Should select all order details by an order's id", async () => {
//           const id = 1;

//           const selected = await executeQuery(
//             { db, role, tableName, id },
//             selectByIdMultiple
//           );

//           assert.isArray(selected);
//           assert.isObject(selected[0]);
//         });

//         it("Should return empty array when id doesnt exist", async () => {
//           const id = 1000;

//           const selected = await executeQuery(
//             { db, role, tableName, id },
//             selectByIdMultiple
//           );

//           assert.isArray(selected);
//           assert.isUndefined(selected[0]);
//         });
//       });
//     });

//     describe("Orders_Users table", () => {
//       beforeEach("Create temporary table orders_users", async function () {
//         await executeQuery(
//           { db, role: roles.ADMIN_ROLE, tableName: tableNames.ORDERS_USERS },
//           createTempTable
//         );
//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             tableName: tableNames.PG_TEMP_ORDERS_USERS,
//             columns: "order_id, user_id, shipped, transaction_id",
//             path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/orders_users.csv",
//           },
//           populateTable
//         );

//         // setup

//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             queryCommand: `GRANT SELECT,INSERT ON ${tableNames.PG_TEMP_ORDERS_USERS} TO ${roles.REGISTERED_ROLE};`,
//           },
//           simpleQuery
//         );
//       });

//       afterEach("Drop temporary table orders_users", async function () {
//         await executeQuery(
//           {
//             db,
//             role: roles.ADMIN_ROLE,
//             tableName: tableNames.PG_TEMP_ORDERS_USERS,
//           },
//           dropTable
//         );
//       });

//       // describe("selectByUserId", () => {
//       //   it("Should select orders by user id", async () => {
//       //     const user_id = 1;
//       //     const tableName = tableNames.PG_TEMP_ORDERS_USERS;
//       //     const role = roles.REGISTERED_ROLE;

//       //     const selected = await executeQuery(
//       //       { db, role, tableName, user_id },
//       //       selectByUserId
//       //     );

//       //     assert.isArray(selected);
//       //     assert.isObject(selected[0]);
//       //   });

//       //   it("Should not select orders by user id when user_id doesnt exist", async () => {
//       //     const user_id = 1000;
//       //     const tableName = tableNames.PG_TEMP_ORDERS_USERS;
//       //     const role = roles.REGISTERED_ROLE;

//       //     const selected = await executeQuery(
//       //       { db, role, tableName, user_id },
//       //       selectByUserId
//       //     );

//       //     assert.isArray(selected);
//       //     assert.isUndefined(selected[0]);
//       //   });
//       // });

//       describe("insertValues", () => {
//         const tableName = tableNames.PG_TEMP_ORDERS_USERS;
//         const role = roles.REGISTERED_ROLE;

//         it("Should insert values", async () => {
//           const ordersUsersObject = {
//             user_id: 2,
//             transaction_id: 1000,
//           };

//           const { columns, queryPrepared, values } =
//             stringCreator.orders_users(ordersUsersObject);

//           const inserted = await executeQuery(
//             { db, tableName, role, columns, queryPrepared, values },
//             insertValues
//           );

//           assert.isObject(inserted);
//         });
//       });
//     });
//   });

//   describe("Admin role", () => {
//     beforeEach("Create temporary table users", async function () {
//       await executeQuery(
//         { db, role: roles.ADMIN_ROLE, tableName: tableNames.USERS },
//         createTempTable
//       );
//       await executeQuery(
//         {
//           db,
//           role: roles.ADMIN_ROLE,
//           tableName: tableNames.PG_TEMP_USERS,
//           columns:
//             "id, first_name, last_name, email, username, is_admin, password",
//           path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/users.csv",
//         },
//         populateTable
//       );
//     });

//     afterEach("Drop temporary table users", async function () {
//       await executeQuery(
//         { db, role: roles.ADMIN_ROLE, tableName: tableNames.PG_TEMP_USERS },
//         dropTable
//       );
//     });

//     beforeEach("Create temporary table products", async function () {
//       await executeQuery(
//         { db, role: roles.ADMIN_ROLE, tableName: tableNames.PRODUCTS },
//         createTempTable
//       );
//       await executeQuery(
//         {
//           db,
//           role: roles.ADMIN_ROLE,
//           tableName: tableNames.PG_TEMP_PRODUCTS,
//           columns: "id, name, description, price, category, preview",
//           path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/products.csv",
//         },
//         populateTable
//       );
//     });

//     afterEach("Drop temporary table products", async function () {
//       await executeQuery(
//         { db, role: roles.ADMIN_ROLE, tableName: tableNames.PG_TEMP_PRODUCTS },
//         dropTable
//       );
//     });

//     beforeEach("Create temporary table orders", async function () {
//       await executeQuery(
//         { db, role: roles.ADMIN_ROLE, tableName: tableNames.ORDERS },
//         createTempTable
//       );
//       await executeQuery(
//         {
//           db,
//           role: roles.ADMIN_ROLE,
//           tableName: tableNames.PG_TEMP_ORDERS,
//           columns: "id, product_id, quantity",
//           path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/orders.csv",
//         },
//         populateTable
//       );
//     });

//     afterEach("Drop temporary table orders", async function () {
//       await executeQuery(
//         { db, role: roles.ADMIN_ROLE, tableName: tableNames.PG_TEMP_ORDERS },
//         dropTable
//       );
//     });

//     beforeEach("Create temporary table orders_users", async function () {
//       await executeQuery(
//         { db, role: roles.ADMIN_ROLE, tableName: tableNames.ORDERS_USERS },
//         createTempTable
//       );
//       await executeQuery(
//         {
//           db,
//           role: roles.ADMIN_ROLE,
//           tableName: tableNames.PG_TEMP_ORDERS_USERS,
//           columns: "order_id, user_id, shipped, transaction_id",
//           path: "/Users/denis/projects/back-end-front-end/server/test/temp_table_data/orders_users.csv",
//         },
//         populateTable
//       );
//     });

//     afterEach("Drop temporary table orders_users", async function () {
//       await executeQuery(
//         {
//           db,
//           role: roles.ADMIN_ROLE,
//           tableName: tableNames.PG_TEMP_ORDERS_USERS,
//         },
//         dropTable
//       );
//     });

//     describe("Users table", () => {
//       describe("deleteValues", () => {
//         it("Should delete values filtered by id", async () => {
//           const id = 1;
//           const tableName = tableNames.PG_TEMP_USERS;
//           const role = roles.ADMIN_ROLE;

//           const output = await executeQuery(
//             { db, tableName, role, id },
//             deleteValuesById
//           );

//           assert.strictEqual(output.success, true);
//         });
//       });
//     });

//     describe("Products table", () => {
//       describe("deleteValues", () => {
//         it("Should delete values filtered by id", async () => {
//           const id = 1;
//           const tableName = tableNames.PG_TEMP_PRODUCTS;
//           const role = roles.ADMIN_ROLE;

//           const output = await executeQuery(
//             { db, tableName, role, id },
//             deleteValuesById
//           );

//           assert.strictEqual(output.success, true);
//         });
//       });

//       describe("insertValues", () => {
//         it("Should insert new values", async () => {
//           const tableName = tableNames.PG_TEMP_PRODUCTS;
//           const role = roles.ADMIN_ROLE;

//           const productObject = {
//             name: "cream",
//             description: "new product",
//             price: 100,
//             category: "health",
//             preview: "www.fake.com",
//           };

//           const { columns, values, queryPrepared } =
//             stringCreator.products(productObject);

//           const output = await executeQuery(
//             { db, tableName, role, columns, values, queryPrepared },
//             insertValues
//           );

//           assert.isObject(output);
//         });
//       });
//     });

//     describe("Orders table", () => {
//       describe("deleteValuesById", () => {
//         it("Should delete values filtered by id", async () => {
//           const id = 1;
//           const tableName = tableNames.PG_TEMP_ORDERS;
//           const role = roles.ADMIN_ROLE;

//           const output = await executeQuery(
//             { db, tableName, role, id },
//             deleteValuesById
//           );

//           assert.strictEqual(output.success, true);
//         });
//       });

//       describe("updateValuesByIdAndProductId", () => {
//         it("Should update quantity filtered by id and product_id", async () => {
//           const columnName = "quantity";
//           const newValue = "10";
//           const id = 5;
//           const product_id = 16;
//           const tableName = tableNames.PG_TEMP_ORDERS;
//           const role = roles.ADMIN_ROLE;

//           const output = await executeQuery(
//             {
//               db,
//               tableName,
//               role,
//               columnName,
//               newValue,
//               id,
//               product_id,
//             },
//             updateValuesByIdAndProductId
//           );

//           assert.isObject(output);
//         });
//       });
//     });

//     describe("Orders_users table", () => {
//       describe("deleteValues", () => {
//         it("Should delete values filtered by id", async () => {
//           const order_id = 1;
//           const tableName = tableNames.PG_TEMP_ORDERS_USERS;
//           const role = roles.ADMIN_ROLE;

//           const output = await executeQuery(
//             { db, tableName, role, order_id },
//             deleteValuesByOrderId
//           );

//           assert.strictEqual(output.success, true);
//         });
//       });
//     });
//   });
// });
