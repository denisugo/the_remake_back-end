require("dotenv").config();

// contsants
const constants = {
  tableNames: {
    USERS: "users",
    PRODUCTS: "products",
    ORDERS: "orders",
    ORDERS_USERS: "orders_users",
    CARTS: "carts",

    PG_TEMP_USERS: "pg_temp.users",
    PG_TEMP_PRODUCTS: "pg_temp.products",
    PG_TEMP_ORDERS: "pg_temp.orders",
    PG_TEMP_ORDERS_USERS: "pg_temp.orders_users",
    PG_TEMP_CARTS: "pg_temp.carts",
  },
  roles: {
    PUBLIC_ROLE: "public_role",
    ADMIN_ROLE: "admin_role",
    REGISTERED_ROLE: "registered_role",
  },
};

module.exports = {
  constants,
};
