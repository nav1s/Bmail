const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const api = supertest(app);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Utility function to create the test user and log him in before running search tests
async function createUserAndLogin(username) {
  await api
    .post('/api/users')
    .send({
      firstName: 'Virgil',
      lastName: 'Van Dijk',
      username: 'Virgil123',
      password: 'pass123'
    })
    .expect(201);

  const loginRes = await api
    .post('/api/tokens')
    .send({ username: 'Virgil123', password: 'pass123' })
    .expect(201);

  return loginRes.body.token;
}

// 1. Missing token
test('JWT 1. Missing Authorization header returns 401', async () => {
  await api
    .patch('/api/users')
    .send({ firstName: 'Hacker' })
    .expect(401);
});

// 2. Malformed token
test('JWT 2. Malformed token returns 401', async () => {
  await api
    .patch('/api/users')
    .set('Authorization', 'bearer not-a-valid-token')
    .send({ firstName: 'Invalid' })
    .expect(401);
});

// 3. Expired token
test('JWT 3. Expired token returns 401', async () => {
  const expiredToken = jwt.sign({ id: 999 }, JWT_SECRET, { expiresIn: '-1s' });

  await api
    .patch('/api/users')
    .set('Authorization', 'bearer ' + expiredToken)
    .send({ firstName: 'Expired' })
    .expect(401);
});

// 4. Token with non-existing user
test('JWT 4. Token with non-existing user returns 401', async () => {
  const fakeToken = jwt.sign({ id: 9999 }, JWT_SECRET, { expiresIn: '1h' });

  await api
    .patch('/api/users')
    .set('Authorization', 'bearer ' + fakeToken)
    .send({ firstName: 'Ghost' })
    .expect(401);
});

// 5. Token signed with wrong secret
test('JWT 5. Token signed with wrong secret returns 401', async () => {
  const fakeSigned = jwt.sign({ id: 1 }, 'wrong-secret', { expiresIn: '1h' });

  await api
    .patch('/api/users')
    .set('Authorization', 'bearer ' + fakeSigned)
    .send({ firstName: 'WrongSecret' })
    .expect(401);
});

// 6. User cannot edit another user (authorization mismatch)
test('JWT 6. User cannot modify another user', async () => {
  // Create two users
  await api.post('/api/users').send({ username: 'u1', firstName: 'a', lastName: 'b', password: '1234' });
  await api.post('/api/users').send({ username: 'u2', firstName: 'c', lastName: 'd', password: '1234' });

  // Login as the first user
  const resLogin = await api.post('/api/tokens').send({ username: 'u1', password: '1234' });
  const token = resLogin.body.token;

  await api
    .patch('/api/users')
    .set('Authorization', 'bearer ' + token)
    .send({ username: 'u2' })
    .expect(400);
});
