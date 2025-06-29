const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');

// Create the test client
const api = supertest(app);

let aliceToken = ''
let bobToken = ''
let carloToken = ''

// Create test user and return the created user data (including id)
async function createTestUserAndReturn() {
  await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "Securep12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
  // .expect('location', /\/api\/users\/1/)
  let response = await api
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
  let loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'alice123', password: 'Securep12!' })
    .expect(201)

  aliceToken = loginResponse.body.token;

  await api
    .post('/api/users')
    .send({
      firstName: "bob",
      lastName: "smith",
      username: "bob",
      password: "Imthebobyboten12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
  // .expect('location', /\/api\/users\/1/)
  response = await api
    .get('/api/users/2')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  assert.deepStrictEqual(response.body, {
    id: 2,
    firstName: "bob",
    lastName: "smith",
    username: "bob"
  });

  loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'bob', password: 'Imthebobyboten12!' })
    .expect(201)
  bobToken = loginResponse.body.token;

  await api
    .post('/api/users')
    .send({
      firstName: "Carlo",
      lastName: "Ancelotti",
      username: "carlo123",
      password: "WeWinChampions12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
  response = await api
    .get('/api/users/3')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  assert.deepStrictEqual(response.body, {
    id: 3,
    username: "carlo123",
    firstName: "Carlo",
    lastName: "Ancelotti",
  });

  loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'carlo123', password: 'WeWinChampions12!' })
    .expect(201)
  carloToken = loginResponse.body.token;
}

// ❌ 4.1 Mail creation without login
test('returns 401 when trying to create mail without login', async () => {
  await api
    .post('/api/mails')
    .send({
      subject: "Test Mail",
      body: "This is a test mail."
    })
    .set('Content-Type', 'application/json')
    .expect(401)
});

// ❌ 4.2 Mail creation with missing fields (must include all: from, to, title, body)
test('returns 400 when required fields are missing', async () => {
  // Ensure the user exists
  await createTestUserAndReturn();

  // print user details for debugging
  const userResponse = await api.get('/api/users/1').expect(200);
  console.log('User details:', userResponse.body);
  // Attempt to create mail without required fields

  await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      subject: "Test Mail"
      // Missing body, from, and to
    })
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Missing fields: to, title, body' });
});

// ✅ 4.3 Valid mail creation
test('creates a valid mail (4.3)', async () => {
  const url1 = 'https://good.com';
  const url2 = 'https://verygood.com';
  const msgBody = `This should work: ${url1} ${url2}`;

  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      to: ["alice123"],
      title: "Hello again",
      body: msgBody,
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["alice123"],
    title: "Hello again",
    body: msgBody,
    id: 1,
    labels: [3, 1],
    draft: false,
    urls: [url1, url2]
  });
});

// ✅ 4.4 Another valid mail creation
test('creates another valid mail (4.32)', async () => {
  const url1 = 'https://liverpool.com';
  const msgBody = `Sign for Liverpool, via ${url1}, its a great club!`;
  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      to: ["alice123"],
      title: "Hello Wirtz",
      body: msgBody,
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["alice123"],
    title: "Hello Wirtz",
    body: msgBody,
    id: 2,
    labels: [3, 1],
    draft: false,
    urls: [url1]
  });
});

// ✅ 4.5 Valid mail Get
test('returns list of last mails (4.4)', async () => {
  const response = await api
    .get('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert(Array.isArray(response.body));
  assert(response.body.length >= 2);
});

// ✅ 4.6 Valid mail GET by id
test('gets mail by id (4.5)', async () => {
  const response = await api
    .get('/api/mails/1')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.id, 1);
  assert.strictEqual(response.body.title, "Hello again");
});

// ❌ 4.7 Invalid mail GET by id
test('returns 404 for invalid mail id (4.6)', async () => {
  await api
    .get('/api/mails/555')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail not found' });
});

// ❌ 4.8 Invalid mail PATCH
test('returns 404 on patching non-existent mail (4.8)', async () => {
  await api
    .patch('/api/mails/555')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({ title: "New Title" })
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail not found' });
});

// ✅ 4.9 Valid mail DELETE
test('deletes mail by id (4.9)', async () => {
  await api
    .delete('/api/mails/1')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(204);
  // Verify the mail is deleted
  await api
    .get('/api/mails/1')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail not found' });
    
});

// ❌ 4.10 Invalid mail DELETE
test('returns 404 on deleting non-existent mail (4.10)', async () => {
  await api
    .delete('/api/mails/555')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail not found' });
});

// ❌ 4.11 Invalid mail POST without the user signed up
test('returns 401 when trying to create mail without login (4.11)', async () => {
  await api
    .post('/api/mails')
    .send({
      to: ["1"],
      title: "Test Mail",
      body: "This is a test mail."
    })
    .set('Content-Type', 'application/json')
    .expect(401)
});

// ✅ 4.12 valid draft creation
test('4.12 valid draft creation', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      to: ["bob"],
      title: "Hello again",
      body: "This should work",
      draft: true
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["bob"],
    title: "Hello again",
    body: "This should work",
    id: 3,
    labels: [4],
    draft: true,
    urls: []
  });
});

// ✅ 4.13 valid mail PATCH
test('4.13 valid mail patch', async () => {
  await api
    .patch('/api/mails/3')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({ title: "Updated Title" })
    .expect(204)

  const getResponse = await api
    .get('/api/mails/3')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
  assert.deepStrictEqual(getResponse.body, {
    from: "alice123",
    to: ["bob"],
    title: "Updated Title",
    body: "This should work",
    id: 3,
    labels: [4],
    draft: true,
    urls: []
  });

});

// ❌ 4.14 invalid mail PATCH
test('invalid mail patch', async () => {
 // Bob tries to update Alice's draft
  await api
    .patch('/api/mails/3')
    .set('Authorization', 'bearer ' + bobToken)
    .set('Content-Type', 'application/json')
    .send({ title: "Updated Title" })
    .expect(403)
});

// ✅ 4.15 Valid draft get by id
test('4.15 valid draft get by id)', async () => {
  const response = await api
    .get('/api/mails/3')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["bob"],
    title: "Updated Title",
    body: "This should work",
    id: 3,
    labels: [4],
    draft: true,
    urls: []
  });
});

// ❌ 4.16 invalid draft get by id
test('4.16 invalid draft get by id)', async () => {
  await api
    .get('/api/mails/3')
    .set('Authorization', 'bearer ' + bobToken)
    .expect(403)
    .expect('Content-Type', /application\/json/);
});

// ✅ 4.17 valid update title
test('4.17 update title', async () => {
  await api
    .patch('/api/mails/3')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({ title: "Updated Title" })
    .expect(204)
  
  const response = await api
    .get('/api/mails/3')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["bob"],
    title: "Updated Title",
    body: "This should work",
    id: 3,
    labels: [4],
    draft: true,
    urls: []
  });

});

// ❌ Recipient cannot delete draft
test('4.17 recipient cannot delete draft', async () => {
  await api
    .delete('/api/mails/3')
    .set('Authorization', 'bearer ' + bobToken)
    .expect(403)
})

// ✅ 4.18 valid draft delete by owner
test('4.18. Sender can delete draft (soft delete)', async () => {
  const res = await api.delete('/api/mails/3')
    .set('Authorization', 'bearer ' + aliceToken);

  assert.strictEqual(res.status, 204);
});

// ❌ 4.19 invalid draft get after delete
test('4.19. Sender cannot access the draft after deleting it', async () => {
  const res = await api.get('/api/mails/3')
    .set('Authorization', 'bearer ' + aliceToken);

  assert.strictEqual(res.status, 404);
});

// ✅ 4.20 valid draft creation
test('4.20 valid draft creation', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      to: ["bob"],
      title: "Hello again",
      body: "This should work again",
      draft: true
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["bob"],
    title: "Hello again",
    body: "This should work again",
    id: 4,
    labels: [4],
    draft: true,
    urls: []
  });
});

// ✅ 4.21 Valid draft get by owner and recipient cannot access
test('4.21 valid draft get by id)', async () => {
  const response = await api
    .get('/api/mails/4')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["bob"],
    title: "Hello again",
    body: "This should work again",
    draft: true,
    labels: [4],
    id: 4,
    urls: []
  });
  await api
    .get('/api/mails/4')
    .set('Authorization', 'bearer ' + bobToken)
    .expect(403)
    .expect('Content-Type', /application\/json/);
});

// ✅ 4.22 valid send draft
test('4.22 send draft', async () => {
  await api
    .patch('/api/mails/4')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({ draft: false })
    .expect(204)
  
  const response = await api
    .get('/api/mails/4')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["bob"],
    title: "Hello again",
    body: "This should work again",
    id: 4,
    labels: [3, 7],
    draft: false,
    urls: []
  });

});

// ✅ 4.23 valid get sent mail by recipient after sending draft
test('4.23 valid get sent mail by recipient after sending draft', async () => {
  const response = await api
    .get('/api/mails/4')
    .set('Authorization', 'bearer ' + bobToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["bob"],
    title: "Hello again",
    body: "This should work again",
    id: 4,
    labels: [3, 7],
    draft: false,
    urls: []
  });
});

// ✅ 4.24 valid get mail by recipient after mail deleted in another user
test('4.24 valid get mail by recipient after mail deleted in another user', async () => {
  const url1 = 'http://good.com';
  const url2 = 'http://verygood.com';
  const msgBody = `This should work: ${url1} ${url2}`;

  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      to: ["alice123", "bob", "carlo123"],
      title: "Hello again friends",
      body: msgBody,
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["alice123", "bob", "carlo123"],
    title: "Hello again friends",
    body: msgBody,
    draft: false,
    labels: [
      3,
      1,
      7,
      13
    ],
    id: 5,
    urls:[url1, url2]
  })
  await api
    .delete('/api/mails/5')
    .set('Authorization', 'bearer ' + bobToken)
    .expect(204);
  const response2 = await api
    .get('/api/mails/5')
    .set('Authorization', 'bearer ' + carloToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  assert.deepStrictEqual(response2.body, {
    from: "alice123",
    to: ["alice123", "bob", "carlo123"],
    title: "Hello again friends",
    body: msgBody,
    draft: false,
    labels: [
      3,
      1,
      7,
      13
    ],
    id: 5,
    urls:[url1, url2]
  })
})
