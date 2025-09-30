const { test } = require("node:test");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const api = supertest(app);
const config = require("../utils/config");

const JWT_SECRET = config.JWT_SECRET;

// 1. Missing token
test("JWT 1. Missing Authorization header returns 401", async () => {
  // No token provided
  // This should return 401 Unauthorized
  await api.patch("/api/users").send({ firstName: "Hacker" }).expect(401);
});

// 2. Malformed token
test("JWT 2. Malformed token returns 401", async () => {
  // Create a malformed token (not a valid JWT)
  await api
    .patch("/api/users")
    .set("Authorization", "bearer not-a-valid-token")
    .send({ firstName: "Invalid" })
    .expect(401);
});

// 3. Expired token
test("JWT 3. Expired token returns 401", async () => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    return;
  }

  // Create a token that is already expired
  const expiredToken = jwt.sign({ id: 999 }, JWT_SECRET, { expiresIn: "-1s" });
  // This should return 401 Unauthorized
  await api
    .patch("/api/users")
    .set("Authorization", "bearer " + expiredToken)
    .send({ firstName: "Expired" })
    .expect(401);
});

// 4. Token with non-existing user
test("JWT 4. Token with non-existing user returns 401", async () => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    return;
  }

  // Create a token for a user that does not exist
  const fakeToken = jwt.sign({ id: 9999 }, JWT_SECRET, { expiresIn: "1h" });
  // This should return 401 Unauthorized
  await api
    .patch("/api/users")
    .set("Authorization", "bearer " + fakeToken)
    .send({ firstName: "Ghost" })
    .expect(401);
});

// 5. Token signed with wrong secret
test("JWT 5. Token signed with wrong secret returns 401", async () => {
  // Create invalid token with the wrong secret
  const fakeSigned = jwt.sign({ id: 1 }, "wrong-secret", { expiresIn: "1h" });
  // This should return 401 Unauthorized
  await api
    .patch("/api/users")
    .set("Authorization", "bearer " + fakeSigned)
    .send({ firstName: "WrongSecret" })
    .expect(401);
});

// 6. User cannot edit another user (authorization mismatch)
test("JWT 6. User cannot modify another user", async () => {
  // Create two users
  await api.post("/api/users").send({
    username: "u1",
    firstName: "a",
    lastName: "b",
    password: "Securepass1234!",
  });
  await api
    .post("/api/users")
    .send({
      username: "u2",
      firstName: "c",
      lastName: "d",
      password: "Securepass1234!",
    });

  // Login as the first user
  const resLogin = await api
    .post("/api/tokens")
    .send({ username: "u1", password: "Securepass1234!" });
  const token = resLogin.body.token;

  // Try to modify the second user
  await api
    .patch("/api/users")
    .set("Authorization", "bearer " + token)
    .send({ username: "u2" })
    .expect(400);
});
