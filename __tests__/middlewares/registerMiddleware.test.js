const { assert } = require("chai");
const db = require("../../db");
const { tableNames, roles } = require("../../config").constants;

const { registerMiddleware } = require("../../middlewares/registerMiddlewares");

describe("Registration middlewares", () => {
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

  describe("registerMiddlewares", () => {
    //* New user parameters
    const body = {
      username: "ronnie123_456_222",
      password: "new-secret-pass",
      email: "ronnie_adams@yandex.ru",
      first_name: "Ronnie",
      last_name: "Adams",
    };

    afterEach(async () => {
      //? This will remove newly created user from users table
      const queryCommand = `DELETE FROM ${tableNames.USERS} WHERE username = '${body.username}' RETURNING *;`;
      await db.query(queryCommand);
    });

    it("Should add a new user to db and call next middleware", async () => {
      //* Mock req object
      const req = {
        body,
      };

      //* Call the middleware
      await registerMiddleware(req, res, next);

      //* Select a newly created user in db
      const selected = (
        await db.query(
          `SELECT * FROM ${tableNames.USERS} WHERE username = '${body.username}';`
        )
      ).rows[0];

      assert.strictEqual(selected.email, body.email);
      assert.strictEqual(nextUsed, true);
    });
    it("Should res with status 400 and 'Incomplete' if info is incomplete", async () => {
      //* Create incomplete body
      const brokenBody = { ...body };
      delete brokenBody.email;

      //* Mock req object
      const req = {
        body: brokenBody,
      };

      //* Call the middleware
      await registerMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "400 Incomplete");
    });
    it("Should res with status 400 and 'Duplicity found' if there is a duplicated username", async () => {
      //? Getting a username of user with id of 1
      const username = (
        await db.query(`SELECT * FROM ${tableNames.USERS} WHERE id = ${1};`)
      ).rows[0].username;

      //* Create incomplete body
      const brokenBody = { ...body };
      brokenBody.username = username;

      //* Mock req object
      const req = {
        body: brokenBody,
      };

      //* Call the middleware
      await registerMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, `400 ${{ message: "Duplicity found" }}`);
    });
  });
});
