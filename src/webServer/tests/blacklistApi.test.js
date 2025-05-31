const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const { url } = require('node:inspector');

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
    // .expect('location', /\/api\/users\/1/)
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
  const response = await api
    .post('/api/blacklist')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({ url: 'http://bad.com' });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(response.body.url, 'http://bad.com');
  assert.strictEqual(response.body.id, encodeURIComponent('http://bad.com'));
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
  const response = await request(app)
    .delete('/api/blacklist/http%3A%2F%2Fbar.com') // wrong URL
    .set(auth);

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(response.body, {
    error: 'mail id not found'
  });
});

// ❌ 1.4 invalid POST mail with blacklisted URL
test('1.4 invalid POST mail with blacklisted URL', async () => {
  const response = await request(app)
    .post('/api/mails')
    .set(auth)
    .send({
      to: ['userB'],
      title: 'Try this site',
      body: `Check this link: ${blacklistedUrl}`
    });

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(response.body, {
    error: 'Malicious URL detected in message'
  });
});

test('1.5 Valid DELETE blacklist', async () => {
  const response = await request(app)
    .delete(`/api/blacklist/${blacklistedId}`)
    .set(auth);

  assert.strictEqual(response.status, 204);
});

test('1.6 Valid POST mail - after DELETE of blacklisted URL', async () => {
  const response = await request(app)
    .post('/api/mails')
    .set(auth)
    .send({
      to: ['userB'],
      title: 'Try this site',
      body: `Check this link: ${blacklistedUrl}`
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(response.body.from, 1);
  assert.deepStrictEqual(response.body.to, ['userB']);
  assert.strictEqual(response.body.title, 'Try this site');
  assert.strictEqual(response.body.body, `Check this link: ${blacklistedUrl}`);
  assert.ok(response.body.id);
  assert.ok(response.body.timestamp);
});
