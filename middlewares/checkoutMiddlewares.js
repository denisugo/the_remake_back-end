const db = require("../db");
const { tableNames } = require("../config").constants;
const { executeQuery, selectByUserId, selectById } = require("../queries");
const { asyncMap, asyncForEach } = require("../utils/asyncFunc");

require("dotenv").config();

//* Stripe setup
const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);

const calculateOrderAmount = async (user_id) => {
  //? This function calculates the final price based on cart items

  //* Generate query command
  const queryCommand = `SELECT SUM(${tableNames.CARTS}.quantity * ${tableNames.PRODUCTS}.price)
    FROM ${tableNames.CARTS}
    JOIN ${tableNames.PRODUCTS}
    ON ${tableNames.CARTS}.product_id = ${tableNames.PRODUCTS}.id
    WHERE ${tableNames.CARTS}.user_id= ${user_id};`;

  //* Retrieve the amount
  const amount = parseInt((await db.query(queryCommand)).rows[0].sum);

  return amount;
};

const postCheckoutMiddleware = async (req, res, next) => {
  const calculatedAmount = await calculateOrderAmount(req.user.id);

  //? Should only proceed if calculated amount is available
  if (!calculatedAmount) return res.status(404).send("No cart found");

  //* Generate  paymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculatedAmount * 100,
    currency: "usd",
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    amount: calculatedAmount,
  });
};

module.exports = { postCheckoutMiddleware };
