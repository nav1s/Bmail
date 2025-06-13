const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const request = require('supertest');

// Create the test client
const api = supertest(app);

let token = ''

// Utility function to create the test user before running search tests
async function createTestUserAndReturn() {
  await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "Securepass123!"
    })
    .set('Content-Type', 'application/json')
    .expect(201);
  
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

  // Get the token for the user
  const loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'alice123', password: 'Securepass123!' })
    .expect(201)

  token = loginResponse.body.token;
}

// Create initial mails for query tests
async function createInitialMails() {
  const mails = [
    { to: ["alice123"], title: "Hello again", body: "This should work" },
    { to: ["alice123"], title: "Hello Wirtz", body: "Sign for Liverpool" },
    { to: ["alice123"], title: "query Match Test", body: "This is a unique phrase xyz123" },
    { to: ["alice123"], title: "Foo bar news", body: "query scores again" },
    { to: ["alice123"], title: "Test query subject", body: "Body with some content" }
  ];

  for (const mail of mails) {
    await api
      .post('/api/mails')
      .set('Authorization', 'bearer ' + token)
      .set('Content-Type', 'application/json')
      .send(mail)
      .expect(201);
  }
}

// Setup: Create user and mails before running tests
test('setup: create user and mails for query tests', async () => {
  await createTestUserAndReturn();
  await createInitialMails();
});

// ✅ 1.0 Search mails by query in title or body
test('returns all mails matching "query" in title or body', async () => {
  const response = await request(app)
    .get('/api/mails/search/query')
    .set('Authorization', 'bearer ' + token)

  assert.strictEqual(response.status, 200);
  const mails = response.body;

  for (const mail of mails) {
    const inTitle = mail.title?.includes("query") ?? false;
    const inBody = mail.body?.includes("query") ?? false;
    assert.ok(
      inTitle || inBody,
      `Expected mail with id=${mail.id} to contain "query" in title or body`
    );
  }
  assert.ok(mails.length > 0, 'No mails returned');
});


