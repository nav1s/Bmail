const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const User = require("../models/usersModel");
const Mail = require("../models/mailsModel");
const { Label } = require("../models/labelsModel");
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


// Utility function to create the test user before running login tests
async function createTestUser() {
  await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "Securepass1234!"
    })
    .set('Content-Type', 'application/json');
}

// ❌ 2.1 Invalid username
test('returns 401 and error message when username does not exist', async () => {
  await api
    .post('/api/tokens')
    .send({
      username: "notexists",
      password: "Securepass1234!"
    })
    .set('Content-Type', 'application/json')
    .expect(401)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Invalid username or password' });
});

// ❌ 2.2 Invalid password
test('returns 401 and error message when password is incorrect', async () => {
  // Ensure the user exists
  await createTestUser();

  await api
    .post('/api/tokens')
    .send({
      username: "alice123",
      password: "wrongpass"
    })
    .set('Content-Type', 'application/json')
    .expect(401)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Invalid username or password' });
});

// ✅ 2.3 Valid login
test('returns 200 and token when login is successful', async () => {
  // Ensure the user exists
  await createTestUser();

  const response = await api
    .post('/api/tokens')
    .send({
      username: "alice123",
      password: "Securepass1234!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
    .expect('Content-Type', /application\/json/);

  // Check that the token is returned
  const assert = require('assert');
  assert.ok(response.body.token);
});

// ❌ 2.4 Missing password
test('returns 401 and error message when password is empty', async () => {
  await createTestUser();

  await api
    .post('/api/tokens')
    .send({
      username: "alice123",
      password: ""
    })
    .set('Content-Type', 'application/json')
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'password must be a non-empty string' });
});

after(async () => {
  await mongoose.connection.close();
});
