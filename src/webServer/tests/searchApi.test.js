const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');

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

// Helper to create mail and return response body
async function createMail(mailData) {
  const res = await api
    .post('/api/mails')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send(mailData)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  return res.body;
}

test('setup: create test user', async () => {
  await createTestUserAndReturn();
});

test('setup: create mails containing the query string in various fields', async () => {
  // Mail with query in title
  await createMail({
    to: ["1"],
    title: "Meeting about query handling",
    body: "Body without the keyword"
  });

  // Mail with query in body
  await createMail({
    to: ["1"],
    title: "No keyword here",
    body: "This body contains the special QUERY keyword."
  });

  // Mail with query in to field
  await createMail({
    to: ["queryUser"],
    title: "Hello",
    body: "Nothing special here"
  });

  // Mail with query in from field (assuming from = 1 is user Alice)
  // For that, create mail from user 1, and we know from = 1, so search for "alice" (username)
  await createMail({
    to: ["1"],
    title: "Just a test",
    body: "Body text"
  });
});

test('GET /api/mails/search/:query returns mails containing query in title, body or to or from', async () => {
  const query = 'query';

  const response = await api
    .get(`/api/mails/search/${encodeURIComponent(query)}`)
    .set('Authorization', '1')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.ok(Array.isArray(response.body), 'Response should be an array');

  response.body.forEach(mail => {
    const q = query.toLowerCase();

    const titleContains = mail.title && mail.title.toLowerCase().includes(q);
    const bodyContains = mail.body && mail.body.toLowerCase().includes(q);
    const toContains = Array.isArray(mail.to) && mail.to.some(toUser => toUser.toLowerCase().includes(q));
    // from can be a number (id) or string (username), here we convert to string and check if contains query
    const fromContains = mail.from && String(mail.from).toLowerCase().includes(q);

    assert.ok(
      titleContains || bodyContains || toContains || fromContains,
      `Mail id ${mail.id} does not contain query '${query}' in any searchable field`
    );
  });
});