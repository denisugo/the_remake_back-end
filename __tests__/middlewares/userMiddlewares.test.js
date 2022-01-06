const { assert } = require("chai");
const db = require("../../db");
const { tableNames, roles } = require("../../config").constants;

const {
  updateUserMiddleware,
  deleteUserMiddleware,
} = require("../../middlewares/userMiddlewares");

describe("User middlewares", () => {
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

  const tableName = tableNames.USERS;

  describe("updateUserMiddleware", () => {
    let selected;
    const id = 1;

    beforeEach(async () => {
      //? Retrieve the object of the user
      //? This will be used for resetting of the product in afterEach
      selected = (
        await db.query(`SELECT * FROM ${tableName} WHERE id = ${id};`)
      ).rows[0];
    });

    afterEach(async () => {
      //? Reset recently updated product
      //? Execute update that will reset the query to its original values
      const queryCommand = `UPDATE ${tableName} SET (username, password, first_name, last_name, email) = ('${selected.username}', '${selected.password}', '${selected.first_name}', '${selected.last_name}', '${selected.email}') WHERE id = ${id};`;
      await db.query(queryCommand);
    });

    it("Should update email", async () => {
      //* New email value
      const newEmail = "jb_star@yahoo.com";

      //* Mock req function
      const req = {
        body: { field: "email", value: newEmail },
        user: { id: 1 },
      };

      await updateUserMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "Updated");
    });
    it("Should return '400 Cannot be updated' when no email provided", async () => {
      //* Mock req function
      const req = {
        body: { field: "email", value: null },
        user: { id: 1 },
      };

      await updateUserMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "400 Cannot be updated");
    });

    it("Should update username", async () => {
      //* New username value
      const newUsername = "jonny1979";
      //* Mock req function
      const req = {
        body: { field: "username", value: newUsername },
        user: { id: 1 },
      };

      await updateUserMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "Updated");
    });
    it("Should not update username when it violates database rules", async () => {
      //* New username value
      const newUsername = "davy000";
      //* Mock req function
      const req = {
        body: { field: "username", value: newUsername },
        user: { id: 1 },
      };

      await updateUserMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(
        sendUsed,
        "400 This username is probably already in use"
      );
    });

    it("Should update password", async () => {
      //* New password value
      const newPassword = "superSecrete";
      //* Mock req function
      const req = {
        body: { field: "password", value: newPassword },
        user: { id: 1 },
      };

      await updateUserMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "Updated");
    });

    it("Should update first_name", async () => {
      //* New first_name value
      const newFirstName = "Lloyd";
      //* Mock req function
      const req = {
        body: { field: "first_name", value: newFirstName },
        user: { id: 1 },
      };

      await updateUserMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "Updated");
    });

    it("Should update last_name", async () => {
      //* New last_name value
      const newLastName = "Lloyd";
      //* Mock req function
      const req = {
        body: { field: "last_name", value: newLastName },
        user: { id: 1 },
      };

      await updateUserMiddleware(req, res, next);

      assert.strictEqual(nextUsed, false);
      assert.strictEqual(sendUsed, "Updated");
    });
  });
  // describe("deleteUserMiddleware", () => {
  //   let selected;
  //   const id = 1;

  //   beforeEach(async () => {
  //     //? Retrieve the object of the user
  //     //? This will be used for resetting of the product in afterEach
  //     selected = (
  //       await db.query(`SELECT * FROM ${tableName} WHERE id = ${id};`)
  //     ).rows[0];
  //   });

  //   afterEach(async () => {
  //     //? Restore recently updated product
  //     //? Execute update that will reset the query to its original values
  //     const queryCommand = `INSERT INTO ${tableName} VALUES (${id}, '${selected.first_name}', '${selected.last_name}', '${selected.email}', '${selected.username}',${selected.is_admin}, '${selected.password}');`;
  //     await db.query(queryCommand);
  //   });

  //   it("Should delete user by id", async () => {
  //     const id = 1;
  //     const req = { body: { id } };

  //     await deleteUserMiddleware(req, res, next);

  //     assert.strictEqual(nextUsed, false);
  //     assert.strictEqual(sendUsed, "204 Successfully deleted");
  //   });

  //   it("Should not delete user if id is not provided", async () => {
  //     const req = { id: undefined };

  //     await deleteUserMiddleware(req, res, next);

  //     assert.strictEqual(nextUsed, false);
  //     assert.strictEqual(sendUsed, "400 The operation cannot be done");
  //   });
  // });
});
