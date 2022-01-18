const { assert } = require("chai");
const db = require("../../db");
const { tableNames } = require("../../config").constants;

const {
  postCheckoutMiddleware,
} = require("../../middlewares/checkoutMiddlewares");

describe("checkoutMiddleware", () => {
  //? Mocking next function
  const next = () => {
    nextUsed = true;
  };

  //? Mocking res function
  //? Now it can mock .send, .status, .clearCookies
  const res = {
    status: (code) => {
      return {
        clearCookie: () => {
          return {
            send: (message) => {
              sendUsed = `${code} ${message}`;
            },
          };
        },
        send: (message) => {
          sendUsed = `${code} ${message}`;
        },
      };
    },
    send: (smth) => (sendUsed = smth),
  };

  //? If some of the functions was used, then send used is set to the returned value
  //? sendUsed can only be set to true or false
  let nextUsed;
  let sendUsed;

  beforeEach(() => {
    nextUsed = false;
    sendUsed = false;
  });

  describe("postCheckoutMiddleware", () => {
    it("Should post a checkout", async () => {
      //? This user always presents in the database and has one item in his cart
      const user_id = 3;
      //* Mock req object
      const req = {
        user: { id: user_id },
      };

      //* Execute middleware function
      await postCheckoutMiddleware(req, res, next);

      assert.isObject(sendUsed);
      assert.isString(sendUsed.clientSecret);
      assert.strictEqual(sendUsed.amount, 450); //? this user has only one item in his cart with price of 90 and quantity of 5

      assert.strictEqual(nextUsed, false);
    });
    it("Should not post if the user has not items in his cart", async () => {
      //? This doesn't have any items in his cart
      const user_id = 1;
      //* Mock req object
      const req = {
        user: { id: user_id },
      };

      //* Execute middleware function
      await postCheckoutMiddleware(req, res, next);

      assert.strictEqual(sendUsed, "404 No cart found");
      assert.strictEqual(nextUsed, false);
    });
  });
});
