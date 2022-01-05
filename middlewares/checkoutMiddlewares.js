const db = require("../db");
const { tableNames, roles } = require("../config").constants;
const {
  executeQuery,
  selectByUserId,
  insertValues,
  updateValuesByUserIdAndProductId,
  deleteValuesByUserIdAndProductId,
  selectById,
} = require("../queries");
const { asyncMap, asyncForEach } = require("../utils/asyncFunc");

require("dotenv").config();

const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);

// const generateId = () => {
//   return Math.floor(Math.random() * Date.now()) + Date.now();
// };

const calculateOrderAmount = async (user) => {
  const role = roles.REGISTERED_ROLE;
  const tableName = tableNames.CARTS;

  const selected = await executeQuery(
    { db, role, tableName, user_id: user.id },
    selectByUserId
  );

  if (JSON.stringify(selected) === "[]") return null;

  let amount = 0;

  await asyncForEach(selected, async (item) => {
    const product = await executeQuery(
      { db, role, tableName: tableNames.PRODUCTS, id: item.product_id },
      selectById
    );

    if (product) amount += item.quantity * product.price;
  });

  return amount;
};

const postCheckoutMiddleware = async (req, res, next) => {
  const calculatedAmount = await calculateOrderAmount(req.user);

  if (!calculatedAmount) return res.status(404).send("No cart found");
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculatedAmount * 100,
    currency: "usd",
    // automatic_payment_methods: {
    //   enabled: true,
    // },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    amount: calculatedAmount,
  });
};

module.exports = { postCheckoutMiddleware };
