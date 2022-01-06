const { assert } = require("chai");
const { authCheck, deserializedUserFinder } = require("../../auth/config");
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
