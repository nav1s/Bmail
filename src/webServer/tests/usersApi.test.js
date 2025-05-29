const { test } = require('node:test')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert/strict');

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
    username: "alice123"});
});

test('returns 400 when trying to create a user with an existing username', async () => {
  // First create a user
  await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "securepass"
    })
    .set('Content-Type', 'application/json');
    
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
    .expect({ error: 'Username already exists.' });
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

