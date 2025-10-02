const { after, before, test, describe } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const api = supertest(app);

const JWT_SECRET = config.JWT_SECRET;

describe('tests for the jwt token', () => {
  before(async () => {
    await mongoose.connect(config.MONGODB_URI);
  });

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

  after(async () => {
    await mongoose.connection.close();
  });

});
