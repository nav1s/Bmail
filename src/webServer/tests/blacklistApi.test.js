const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');

// Create the test client
const api = supertest(app);

let token = ''
let spamLabelId = 0;

// Create test user and return the created user data (including id)
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

  // Get the token for the user
  const loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'alice123', password: 'Securepass123!' })
    .expect(201)

  token = loginResponse.body.token;
}

// ✅ 1.1 Valid POST blacklist
test('1.1 Valid POST blacklist', async () => {
  await createTestUserAndReturn();
  await api
    .post('/api/blacklist')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ url: 'http://bad.com' })
    .expect(201);

});

// ❌ 1.2 invalid POST blacklist - missing arguments
test('1.2 Invalid POST blacklist - missing arguments', async () => {
  const response = await api
    .post('/api/blacklist')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ url: '' });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(response.body.error, 'Missing fields: url');
});

// ❌ 1.3 invalid DELETE blacklist - wrong id
test('1.3 invalid DELETE blacklist - wrong id', async () => {
  const url = encodeURIComponent('http://bar.com');
  const response = await api
    .delete(`/api/blacklist/${url}`) // wrong URL
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')

  assert.strictEqual(response.status, 404);
  assert.deepStrictEqual(response.body, {
    error: 'URL not found in blacklist'
  });
});

// ❌ 1.4 POST mail with blacklisted URL in body - should be moved to spam
test('1.4 POST mail with blacklisted URL in body - should be moved to spam', async () => {
  // print labels for debugging
  console.log('Labels before sending mail:', await api.get('/api/labels').set('Authorization', 'bearer ' + token).expect(200).then(res => res.body));
  let response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + token)
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

  // get the spam label id
  const spamLabelResponse = await api
    .get('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .expect(200);
  assert.strictEqual(spamLabelResponse.status, 200);

  const spamLabel = spamLabelResponse.body.find(label => label.name === 'Spam');
  spamLabelId = spamLabel.id;
  assert.ok(spamLabelId, 'Spam label should exist');

  const labels = response.body.labels;
  // check that the mail has been moved to spam
  assert.ok(labels.includes(spamLabelId), 'Mail should be moved to Spam label');

});

// ❌ 1.5 POST mail with one blacklisted URL and one url that hasn't been blacklisted - should be moved to spam
test('1.5 POST mail with one blacklisted URL and one url that hasn\'t been blacklisted - should be moved to spam', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({
      to: ["alice123"],
      title: "Try this site",
      body: "Check this link: http://bmail.com and http://bad.com"
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(response.body.from, 'alice123');
  assert.deepStrictEqual(response.body.to, ['alice123']);
  assert.strictEqual(response.body.title, 'Try this site');
  assert.strictEqual(response.body.body, 'Check this link: http://bmail.com and http://bad.com');
  assert.ok(response.body.id);
  // Check that the mail has been moved to spam
  const labels = response.body.labels;
  assert.ok(labels.includes(spamLabelId), 'Mail should be moved to Spam label');
});

// ❌ 1.6 POST mail with blacklisted URL in title - should be moved to spam
test('1.6 invalid POST mail with blacklisted URL in title - should be moved to spam', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + token)
    .send({
      to: ["alice123"],
      title: 'try this site http://bad.com',
      body: 'Check this link:'
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(response.body.from, 'alice123');
  assert.deepStrictEqual(response.body.to, ['alice123']);
  assert.strictEqual(response.body.title, 'try this site http://bad.com');
  assert.strictEqual(response.body.body, 'Check this link:');
  assert.ok(response.body.id);
  // Check that the mail has been moved to spam
  const labels = response.body.labels;
  assert.ok(labels.includes(spamLabelId), 'Mail should be moved to Spam label');
});


// ✅ 1.7 Valid DELETE blacklist
test('1.7 Valid DELETE blacklist', async () => {
  const blacklistedId = encodeURIComponent('http://bad.com');
  const response = await api
    .delete(`/api/blacklist/${blacklistedId}`)
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')

  assert.strictEqual(response.status, 204);
});

// ✅ 1.8 Valid POST mail - after DELETE of blacklisted URL
test('1.8 Valid POST mail - after DELETE of blacklisted URL', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + token)
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

