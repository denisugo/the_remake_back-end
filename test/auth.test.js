const { assert } = require("chai");
const { authCheck, deserializedUserFinder } = require("../auth/config");

describe("Auth", () => {
  describe("authCheck", () => {
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
      const username = "jb";
      const password = "secret";

      const expected = {
        id: 1,
        first_name: "Joe",
        last_name: "Barbora",
        email: "joe_barbora@gmail.com",
        username,
        is_admin: true,
      };

      const output = await authCheck(username, password, done);

      assert.deepEqual(output.result, expected);
      assert.strictEqual(output.err, null);
      assert.isUndefined(output.message);
    });
    it("Should return a message that the username or password were incorrect (incorrect username)", async () => {
      const username = "logi";
      const password = "secret";

      const expected = { message: "Incorrect username or password" };

      const output = await authCheck(username, password, done);

      assert.strictEqual(output.result, false);
      assert.strictEqual(output.err, null);
      assert.deepEqual(output.message, expected);
    });
    it("Should return a message that the username or password were incorrect (incorrect password)", async () => {
      const username = "jb";
      const password = "sec";

      const expected = { message: "Incorrect username or password" };

      const output = await authCheck(username, password, done);

      assert.strictEqual(output.result, false);
      assert.strictEqual(output.err, null);
      assert.deepEqual(output.message, expected);
    });
  });

  describe("deserializedUserFinder", () => {
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

      const expected = {
        id: 1,
        first_name: "Joe",
        last_name: "Barbora",
        email: "joe_barbora@gmail.com",
        username: "jb",

        is_admin: true,
      };

      await deserializedUserFinder(id, done);

      assert.deepEqual(result, expected);
    });
  });
});
