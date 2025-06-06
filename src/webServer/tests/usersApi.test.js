const { test } = require('node:test')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert/strict');

// Create the test client
const api = supertest(app)

// ❌ 1.1 Missing required fields
test('returns 400 and error message when required fields are missing', async () => {
  await api
    .post('/api/users')
    .send({ firstName: 'Alice' })
    .set('Content-Type', 'application/json')
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Missing fields: username, lastName, password' });
});

// ✅ 1.2 Successful registration
test('successfully creates a new user when all required fields are provided', async () => {
  await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "securepass"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
    .expect('location', /\/api\/users\/1/)
  const response = await api
    .get('/api/users/1')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    id: 1,
    firstName: "Alice",
    lastName: "Test",
    username: "alice123"
  });
});

// ❌ 1.3 Invalid existing username create
test('returns 400 when trying to create a user with an existing username', async () => {
  // Try to create another user with the same username
  await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test2",
      username: "alice123",
      password: "newpass"
    })
    .set('Content-Type', 'application/json')
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Username already exists' });
});

// ❌ 1.4 Missing content in required fields in registration
test('returns 400 and error message when required fields have empty values', async () => {
  await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "",
      username: "alice1234",
      password: "securepass"
    })
    .set('Content-Type', 'application/json')
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Missing fields: lastName' });
});

// ✅ 1.5 Valid Patch firstName of user
test('1.5 Patch: Successfully update firstName of user', async () => {
  await api
    .post('/api/users')
    .send({
      firstName: "Bob",
      lastName: "Marley",
      username: "bob1",
      password: "password123"
    })
    .expect(201);

  // Get the token for the user
  const loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'bob1', password: 'password123' })
    .expect(201)

  const token = loginResponse.body.token;

  await api
    .patch('/api/users')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'bearer ' + token)
    .send({ firstName: 'Not Bob' })
    .expect(204);

  const res = await api.get('/api/users/2').expect(200);
  assert.strictEqual(res.body.firstName, 'Not Bob');
});

// ✅ 1.6 get user by ID after patch
test('1.6 Confirm patch persisted', async () => {
  const res = await api
    .get('/api/users/2')
    .expect(200);

  assert.strictEqual(res.body.firstName, 'Not Bob');
});

// ❌ 1.7 Invalid edit non-editable fields like id
test('1.7 Invalid edit non-editable fields like id', async () => {
  // Get the token for the user
  const loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'bob1', password: 'password123' })
    .expect(201)

  const token = loginResponse.body.token;

  await api
    .patch('/api/users')
    .set('Authorization', 'bearer ' + token)
    .send({ id: 999 })
    .expect(400);
});

// ❌ 1.8 Invalid edit field with non-string value
test('1.8 Invalid edit field with non-string value', async () => {
  // Get the token for the user
  const loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'bob1', password: 'password123' })
    .expect(201)

  const token = loginResponse.body.token;

  const res = await api
    .patch('/api/users')
    .set('Authorization', 'bearer ' + token)
    .send({ firstName: 12345 })
    .expect(400);

  assert.strictEqual(res.body.error, 'Field "firstName" must be a string');
});
