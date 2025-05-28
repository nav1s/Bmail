const { test } = require('node:test')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('returns 400 and error message when required fields are missing', async () => {
  await api
    .post('/api/users')
    .send({ firstName: 'Alice' })
    .set('Content-Type', 'application/json')
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Missing fields: username, lastname, password' });
});

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
