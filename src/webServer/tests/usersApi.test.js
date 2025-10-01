const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const User = require("../models/usersModel");
const Mail = require("../models/mailsModel");
const { Label } = require("../models/labelsModel");
const supertest = require("supertest");
const app = require("../app");
const assert = require("node:assert/strict");

// Create the test client
const api = supertest(app);

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
  await User.deleteMany({});
  await Mail.deleteMany({});
  await Label.deleteMany({});
});

// ❌ 1.1 Missing required fields
test("returns 400 and error message when required fields are missing", async () => {
  await api
    .post("/api/users")
    .send({ firstName: "Alice" })
    .set("Content-Type", "application/json")
    .expect(400)
    .expect("Content-Type", /application\/json/)
    .expect({ error: "Missing fields: username, lastName, password" });
});

// ✅ 1.2 Successful registration
test("successfully creates a new user when all required fields are provided", async () => {
  const user = await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "Securepass123!",
    })
    .set("Content-Type", "application/json")
    .expect(201);
  const location = user.header.location;
  const response = await api
    .get(location)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.deepStrictEqual(response.body.firstName, "Alice");
  assert.deepStrictEqual(response.body.lastName, "Test");
  assert.deepStrictEqual(response.body.username, "alice123");
});
// ❌ 1.3 Invalid existing username create
test("returns 400 when trying to create a user with an existing username", async () => {
  // Try to create another user with the same username
  await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "Test2",
      username: "alice123",
      password: "Securepass123!",
    })
    .set("Content-Type", "application/json")
    .expect(400)
    .expect("Content-Type", /application\/json/)
    .expect({ error: "Username already exists" });
});

// ❌ 1.4 Missing content in required fields in registration
test("returns 400 and error message when required fields have empty values", async () => {
  await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "",
      username: "alice1234",
      password: "Securepass123!",
    })
    .set("Content-Type", "application/json")
    .expect(400)
    .expect("Content-Type", /application\/json/)
    .expect({ error: "Missing fields: lastName" });
});

// ✅ 1.5 Valid Patch firstName of user
test("1.5 Patch: Successfully update firstName of user", async () => {
  let res = await api
    .post("/api/users")
    .send({
      firstName: "Bob",
      lastName: "Marley",
      username: "bob1",
      password: "Securepass123!",
    })
    .expect(201);

  // Get the token for the user
  const loginResponse = await api
    .post("/api/tokens")
    .send({ username: "bob1", password: "Securepass123!" })
    .expect(201);

  const token = loginResponse.body.token;

  await api
    .patch("/api/users")
    .set("Content-Type", "application/json")
    .set("Authorization", "bearer " + token)
    .send({ firstName: "Not Bob" })
    .expect(204);
  let location = res.header.location;
  console.log("location: " + location);

  res = await api.get(location).expect(200);
  assert.strictEqual(res.body.firstName, "Not Bob");
});

// ❌ 1.8 Invalid edit field with non-string value
test("1.8 Invalid edit field with non-string value", async () => {
  // Get the token for the user
  const loginResponse = await api
    .post("/api/tokens")
    .send({ username: "bob1", password: "Securepass123!" })
    .expect(201);

  const token = loginResponse.body.token;

  const res = await api
    .patch("/api/users")
    .set("Authorization", "bearer " + token)
    .send({ firstName: 12345 })
    .expect(400);

  assert.strictEqual(res.body.error, "firstName must be a non-empty string");
});

// ❌ 1.9 Invalid registration with invalid password format - too short
test("1.9 Invalid registration with invalid password format", async () => {
  await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "Alice",
      password: "Alice1!",
    })
    .set("Content-Type", "application/json")
    .expect(400)
    .expect("Content-Type", /application\/json/)
    .expect({
      error:
        "Password is too weak. Use at least 8 characters including letters and numbers.",
    });
});

// ❌ 1.10 Invalid registration with invalid password format - no special char
test("1.10 Invalid registration with invalid password format - no special char", async () => {
  await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "Alice",
      password: "Alice1234",
    })
    .set("Content-Type", "application/json")
    .expect(400)
    .expect("Content-Type", /application\/json/)
    .expect({
      error:
        "Password is too weak. Use at least 8 characters including letters and numbers.",
    });
});

// ❌ 1.11 Invalid registration with invalid password format - no uppercase letter
test("1.11 Invalid registration with invalid password format - no uppercase letter", async () => {
  await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice3!",
      password: "nouppercase123!",
    })
    .set("Content-Type", "application/json")
    .expect(400)
    .expect("Content-Type", /application\/json/)
    .expect({
      error:
        "Password is too weak. Use at least 8 characters including letters and numbers.",
    });
});

// ❌ 1.12 Invalid registration with invalid password format - no lowercase letter
test("1.12 Invalid registration with invalid password format - no lowercase letter", async () => {
  await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "Alice4!",
      password: "NOLOWERCASE123!",
    })
    .set("Content-Type", "application/json")
    .expect(400)
    .expect("Content-Type", /application\/json/)
    .expect({
      error:
        "Password is too weak. Use at least 8 characters including letters and numbers.",
    });
});

// ❌ 1.13 Invalid registration with invalid password format - no digit
test("1.13 Invalid registration with invalid password format - no digit", async () => {
  await api
    .post("/api/users")
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "Alice5!",
      password: "NoDigitAtAll!",
    })
    .set("Content-Type", "application/json")
    .expect(400)
    .expect("Content-Type", /application\/json/)
    .expect({
      error:
        "Password is too weak. Use at least 8 characters including letters and numbers.",
    });
});

after(async () => {
  await mongoose.connection.close();
});
