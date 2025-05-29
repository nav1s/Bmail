const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const request = require('supertest');

const api = supertest(app);

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
}

async function createInitialMails() {
  const mails = [
    { to: [1], title: "Hello again", body: "This should work" },
    { to: [1], title: "Hello Wirtz", body: "Sign for Liverpool" },
    { to: [1], title: "query Match Test", body: "This is a unique phrase xyz123" },
    { to: [1], title: "Foo bar news", body: "query scores again" },
    { to: [1], title: "Test query subject", body: "Body with some content" }
  ];

  for (const mail of mails) {
    await api
      .post('/api/mails')
      .set('Authorization', '1')
      .set('Content-Type', 'application/json')
      .send(mail)
      .expect(201);
  }
}

test('setup: create user and mails for query tests', async () => {
  await createTestUserAndReturn();
  await createInitialMails();
});

test('returns all mails matching "query" in title or body', async () => {
  const response = await request(app)
    .get('/api/mails/search/query')
    .set('Authorization', '1')

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


