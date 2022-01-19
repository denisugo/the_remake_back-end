const { assert } = require("chai");
const {
  authCheck,
  authCheckFacebook,
  deserializedUserFinder,
} = require("../../auth/config");
const db = require("../../db");
const { tableNames } = require("../../config").constants;

describe("Auth", () => {
  describe("authCheck", () => {
    //* Mock done function
    let done;
    beforeEach(() => {
      done = (err, result, message) => {
        return {
          err,
          result,
          message,
        };
      };
    });

    it("Should find a user with username and password provided", async () => {
      //* Credentials
      const username = "jb";
      const password = "secret";
      const id = 1;

      //* Expected user object
      const expected = (
        await db.query(`SELECT * FROM ${tableNames.USERS} WHERE id = ${id};`)
      ).rows[0];

      const output = await authCheck(username, password, done);

      assert.deepEqual(output.result, expected);
      assert.strictEqual(output.err, null);
      assert.isUndefined(output.message);
    });
    it("Should return a message that the username or password were incorrect (incorrect username)", async () => {
      //* Credentials
      const username = "logi";
      const password = "secret";

      //* Expected object
      const expected = { message: "Incorrect username or password" };

      const output = await authCheck(username, password, done);

      assert.strictEqual(output.result, false);
      assert.strictEqual(output.err, null);
      assert.deepEqual(output.message, expected);
    });
    it("Should return a message that the username or password were incorrect (incorrect password)", async () => {
      //* Credentials
      const username = "jb";
      const password = "sec";

      //* Expected object
      const expected = { message: "Incorrect username or password" };

      const output = await authCheck(username, password, done);

      assert.strictEqual(output.result, false);
      assert.strictEqual(output.err, null);
      assert.deepEqual(output.message, expected);
    });
  });

  describe("authCheckFacebook", () => {
    //* Mock done function
    let done;
    beforeEach(() => {
      done = (err, result, message) => {
        return {
          err,
          result,
          message,
        };
      };
    });

    //* Credentials
    const id = 1222;
    const first_name = "Alan";
    const last_name = "Grant";
    const username = `${id.toString()}facebook`;
    const password = "facebookSecret";

    after(async () => {
      //? This will remove newly created user from users table
      const queryCommand = `DELETE FROM ${tableNames.USERS} WHERE username = '${username}' RETURNING *;`;
      await db.query(queryCommand);
    });

    it("Should create a user with id provided", async () => {
      //* Expected user object

      const output = await authCheckFacebook(
        null,
        null,
        { _json: { id, first_name, last_name } },
        done
      );

      const expected = (
        await db.query(
          `SELECT * FROM ${tableNames.USERS} WHERE username = '${username}';`
        )
      ).rows[0];

      assert.deepEqual(output.result, expected);
      assert.strictEqual(output.err, null);
      assert.isUndefined(output.message);
    });
    it("Should return a message that something went wrong if no id provided", async () => {
      //* Expected object
      const expected = { message: "Something went wrong" };

      const output = await authCheckFacebook(
        null,
        null,
        { _json: { id: undefined, first_name, last_name } },
        done
      );

      assert.strictEqual(output.result, false);
      assert.strictEqual(output.err, null);
      assert.deepEqual(output.message, expected);
    });
  });

  describe("deserializedUserFinder", () => {
    //* Mock done function
    let done;
    let result;
    let err;
    beforeEach(() => {
      done = (_err, _result) => {
        err = _err;
        result = _result;
      };
    });

    it("Should find a user by id", async () => {
      const id = 1;

      //* Expected user object
      const expected = (
        await db.query(`SELECT * FROM ${tableNames.USERS} WHERE id = ${id};`)
      ).rows[0];

      await deserializedUserFinder(id, done);

      assert.deepEqual(result, expected);
    });
  });
});
