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

const getProductsByCategoryMiddleware = async (req, res, next) => {
  //? Get products should send back a list with all available products
  // const category = req.query.category;
  // const role = roles.PUBLIC_ROLE;

  // const selected = await executeQuery(
  //   { db, role, tableName, category },
  //   selectByCategory
  // );

  // if (selected) return res.send({ user: req.user, products: selected });

  // const allProducts = await executeQuery(
  //   { db, role, tableName },
  //   selectByTableName
  // );

  // if (allProducts) return res.send({ user: req.user, products: allProducts });

  // return res.status(500).send("");
  const { rows } = await db.query("SELECT * FROM products;");
  if (rows) return res.send(products);
  return res.status(500).send("");
};

const getProductByIdMiddleware = async (req, res, next) => {
  const id = parseInt(req.params.id);
  const role = roles.PUBLIC_ROLE;
  const selected = await executeQuery({ db, tableName, role, id }, selectById);

  if (selected) return res.send(selected);

  return res.status(404).send("Not found");
};

const postProductMiddleware = async (req, res, next) => {
  if (req.body) {
    const body = req.body;
    if (
      body.name &&
      body.description &&
      body.price &&
      body.category &&
      body.preview
    ) {
      const role = roles.ADMIN_ROLE;
      const { columns, values, queryPrepared } = stringCreator.products(body);
      const inserted = await executeQuery(
        { db, tableName, role, columns, values, queryPrepared },
        insertValues
      );
      if (inserted) {
        const allProducts = await executeQuery(
          { db, role, tableName },
          selectByTableName
        );

        if (allProducts) return res.status(201).send(allProducts);
      }
    }
  }
  return res.status(400).send("Check your input");
};

const putProductMiddleware = async (req, res, next) => {
  const id = req.params.id;
  if (req.body && id) {
    if (req.body.field && req.body.value) {
      const columnName = req.body.field;
      const newValue = req.body.value;
      const tableName = tableNames.PRODUCTS;
      const role = roles.ADMIN_ROLE;
      const updated = await executeQuery(
        { db, role, tableName, columnName, newValue, id },
        updateValuesById
      );
      if (updated) return res.send("Updated");
    }
  }
  return res.status(400).send("Cannot be updated");
};

const deleteProductMiddleware = async (req, res, next) => {
  const id = req.params.id;
  if (id) {
    const role = roles.ADMIN_ROLE;

    const deleted = await executeQuery(
      { db, tableName, role, id },
      deleteValuesById
    );
    if (deleted) return res.status(204).send("Successfully deleted");
  }
  return res.status(400).send("The operation cannot be done");
};

module.exports = {
  getProductsByCategoryMiddleware,
  getProductByIdMiddleware,
  postProductMiddleware,
  putProductMiddleware,
  deleteProductMiddleware,
};
