const { test, beforeEach } = require('node:test');
const assert = require('assert');
const supertest = require('supertest');
const app = require('../app');

// Create the test client
const api = supertest(app);

// Create test user and return the created user data (including id)
async function createTestUserAndReturn() {
  const res = await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "securepass"
    })
    .set('Content-Type', 'application/json')
    .expect(201);

  return res.body;
}

// ✅ 3.1 Valid user ID
test('returns 200 and user info for valid user ID', async () => {
  // 1. צור את המשתמש
  const createResponse = await api
    .post('/api/users')
    .send({
      username: 'alice123',
      firstName: 'Alice',
      lastName: 'Test',
      password: 'testpass'
    })
    .expect(201); // created

  const userId = createResponse.body.id;

  // 2. קבל את פרטי המשתמש
  const response = await api
    .get(`/api/users/${userId}`)
    .expect(200);

  // 3. ודא את התוכן
  assert.deepStrictEqual(response.body, {
    id: userId,
    username: 'alice123',
    firstName: 'Alice',
    lastName: 'Test'
  });
});

// ❌ 3.2 Invalid user ID (non-existing ID)
test('returns 404 and error for invalid user ID', async () => {
    const response = await api.get('/api/users/999');
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'User not found');
});

// ❌ 3.3 Missing user ID (e.g. trailing slash with no ID)
test('returns 404 and error for missing user ID in URL', async () => {
    const response = await api.get('/api/users/');
    assert.strictEqual(response.status, 404);
    // Optional: you can check the error message text
    assert.match(response.text, /Cannot GET \/api\/users\/?/);
});
