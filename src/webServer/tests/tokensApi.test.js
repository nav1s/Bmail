const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const User = require("../models/usersModel");
const Mail = require("../models/mailsModel");
const { Label } = require("../models/labelsModel");
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');

// Create the test client
const api = supertest(app);

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
  await User.deleteMany({});
  await Mail.deleteMany({});
  await Label.deleteMany({});
});

let location
// Create test user and return the created user data (including id)
async function createTestUserAndReturn() {
  let res = await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "Securepass123!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)

  location = res.header.location;
}

// ✅ 3.1 Valid user ID
test('returns 200 and user info for valid user ID', async () => {
  await createTestUserAndReturn();
  const response = await api.get(location).expect(200).expect('Content-Type', /application\/json/);

  assert.deepEqual(response.body.firstName, "Alice");
  assert.deepEqual(response.body.lastName, "Test");
  assert.deepEqual(response.body.username, "alice123");

});

// ❌ 3.3 Missing user ID (e.g. trailing slash with no ID)
test('returns 404 and error for missing user ID in URL', async () => {
  const response = await api.get('/api/users/');
  assert.strictEqual(response.status, 404);
  // Optional: you can check the error message text
  assert.match(response.text, /Cannot GET \/api\/users\/?/);
});

after(async () => {
  await mongoose.connection.close();
});
