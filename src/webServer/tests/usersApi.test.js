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
    username: "alice123"});
});

// ❌ 1.3 Invalid existing username create
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

  const patchRes = await api
    .patch('/api/users/2')
    .set('Authorization', '2')
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
  const res = await api
    .patch('/api/users/2')
    .send({ id: 999 })
    .expect(400);

  assert.notStrictEqual(res.body.id, 999);
  assert.strictEqual(res.body.id, 2);
});

// ❌ 1.8 Invalid edit field with non-string value
test('1.8 Invalid edit field with non-string value', async () => {
  const res = await api
    .patch('/api/users/2')
    .send({ firstName: 12345 })
    .expect(400);

  assert.strictEqual(res.body.error, 'Field "firstName" must be a string');
});

// ❌ 1.9 Invalid Patch user with invalid ID (not found)
test('1.9 Invalid Patch user with invalid ID (not found)', async () => {
  const res = await api
    .patch('/api/users/999')
    .send({ firstName: 'ghost' })
    .expect(404);

  assert.strictEqual(res.body.error, 'User not found');
});

// ❌ 1.10 Invalid Patch user with other user ID
test('1.10 User cannot edit another user (403 Forbidden)', async () => {
  // try to update user with id = 2 with token of user who has id = 1 meaning another user.
  const res = await api
    .patch('/api/users/2')
    .set('Authorization', '1') // login with alice = user with id = 1.
    .send({ firstName: 'HackedName' })
    .expect(403);

  assert.strictEqual(res.body.error, 'You are allowed to edit only your own user');
});

// ❌ Invalid patch user with non-numeric ID (400)
test('1.11 Cannot patch user with non-numeric ID (400)', async () => {
  const res = await api
    .patch('/api/users/notanumber')
    .set('Authorization', '1')
    .send({ firstName: 'Fail' })
    .expect(400);

  assert.strictEqual(res.body.error, 'User ID must be a valid integer');
});