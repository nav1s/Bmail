const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');

// Create the test client
const api = supertest(app);

// Create test user and return the created user data (including id)
async function createTestUserAndReturn() {
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
}

// ✅ 1.1 Valid POST blacklist
test('1.1 Valid POST blacklist', async () => {
  await createTestUserAndReturn();
  await api
    .post('/api/blacklist')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({ url: 'http://bad.com' })
    .expect(201);

});

// ❌ 1.2 invalid POST blacklist - missing arguments
test('1.2 Invalid POST blacklist - missing arguments', async () => {
  const response = await api
    .post('/api/blacklist')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({url: ''});

  assert.strictEqual(response.status, 400);
  assert.strictEqual(response.body.error, 'Missing fields: url');
});

// ❌ 1.3 invalid DELETE blacklist - wrong id
test('1.3 invalid DELETE blacklist - wrong id', async () => {
  const url = encodeURIComponent('http://bar.com');
  const response = await api
    .delete(`/api/blacklist/${url}`) // wrong URL
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')

  assert.strictEqual(response.status, 404);
  assert.deepStrictEqual(response.body, {
    error: 'URL not found in blacklist'
  });
});

// ❌ 1.4 invalid POST mail with blacklisted URL
test('1.4 invalid POST mail with blacklisted URL', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({
      to: ['alice123'],
      title: 'Try this site',
      body: `Check this link: http://bad.com`
    });

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(response.body, {
    error: 'Malicious URL detected in message'
  });
});

// ✅ 1.5 Valid DELETE blacklist
test('1.5 Valid DELETE blacklist', async () => {
  const blacklistedId = encodeURIComponent('http://bad.com');
  const response = await api
    .delete(`/api/blacklist/${blacklistedId}`)
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')

  assert.strictEqual(response.status, 204);
});

// ✅ 1.6 Valid POST mail - after DELETE of blacklisted URL
test('1.6 Valid POST mail - after DELETE of blacklisted URL', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({
      to: ['alice123'],
      title: 'Try this site',
      body: 'Check this link: http://bad.com'
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(response.body.from, 'alice123');
  assert.deepStrictEqual(response.body.to, ['alice123']);
  assert.strictEqual(response.body.title, 'Try this site');
  assert.strictEqual(response.body.body, 'Check this link: http://bad.com');
  assert.ok(response.body.id);
});
