const stringCreator = {
  users: (userObject) => {
    return {
      columns: "first_name, last_name, email, username, password",
      values: [
        userObject.first_name,
        userObject.last_name,
        userObject.email,
        userObject.username,
        userObject.password,
      ],
      queryPrepared: "$1, $2, $3, $4, $5",
    };
  },
  products: (productObject) => {
    return {
      columns: "name, description, price, category, preview",
      values: [
        productObject.name,
        productObject.description,
        productObject.price,
        productObject.category,
        productObject.preview,
      ],
      queryPrepared: "$1, $2, $3, $4, $5",
    };
  },
  orders: (orderObject) => {
    return {
      columns: "id, product_id, quantity",
      values: [orderObject.id, orderObject.product_id, orderObject.quantity],
      queryPrepared: "$1, $2, $3",
    };
  },
  orders_users: (ordersUsersObject) => {
    return {
      columns: "user_id, transaction_id",
      values: [ordersUsersObject.user_id, ordersUsersObject.transaction_id],
      queryPrepared: "$1, $2",
    };
  },
  cart: (cartObject) => {
    return {
      columns: "user_id, product_id, quantity",
      values: [cartObject.user_id, cartObject.product_id, cartObject.quantity],
      queryPrepared: "$1, $2, $3",
    };
  },
};

module.exports = stringCreator;
