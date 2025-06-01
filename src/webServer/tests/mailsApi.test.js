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

// Create second test user and return the created user data (including id)
async function createSecondTestUserAndReturn() {
  await api
    .post('/api/users')
    .send({
      firstName: "Bob",
      lastName: "Test",
      username: "Bob123",
      password: "securepass"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
    // .expect('location', /\/api\/users\/1/)
  const response = await api
    .get('/api/users/2')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  assert.deepStrictEqual(response.body, {
    id: 2,
    firstName: "Bob",
    lastName: "Test",
    username: "Bob123"
  });
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
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'You must be logged in' });
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
    .send({
      subject: "Test Mail"
      // Missing body, from, and to
    })
    .set('Content-Type', 'application/json')
    .set('Authorization', '1') // Assuming user ID 1 is logged in
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Missing fields: to, title, body' });
});

// ✅ 4.31 Valid mail creation
test('creates a valid mail (4.31)', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({
      to: ["alice123"],
      title: "Hello again",
      body: "This should work"
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["alice123"],
    title: "Hello again",
    body: "This should work",
    id: 1
  });
});

// ✅ 4.32 Another valid mail creation
test('creates another valid mail (4.32)', async () => {
  const response = await api
    .post('/api/mails')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({
      to: ["alice123"],
      title: "Hello Wirtz",
      body: "Sign for Liverpool"
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    from: "alice123",
    to: ["alice123"],
    title: "Hello Wirtz",
    body: "Sign for Liverpool",
    id: 2
  });
});

// ✅ 4.4 Valid mail Get
test('returns list of last mails (4.4)', async () => {
  const response = await api
    .get('/api/mails')
    .set('Authorization', '1')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert(Array.isArray(response.body));
  assert(response.body.length >= 2);
});

// ✅ 4.5 Valid mail GET by id
test('gets mail by id (4.5)', async () => {
  const response = await api
    .get('/api/mails/1')
    .set('Authorization', '1')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.id, 1);
  assert.strictEqual(response.body.title, "Hello again");
});

// ❌ 4.6 Invalid mail GET by id
test('returns 404 for invalid mail id (4.6)', async () => {
  await api
    .get('/api/mails/555')
    .set('Authorization', '1')
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail not found' });
});

// ✅ 4.7 Valid mail PATCH
test('updates mail title by id (4.7)', async () => {
  const response = await api
    .patch('/api/mails/1')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({ title: "Updated Title" })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.title, "Updated Title");
});

// ❌ 4.8 Invalid mail PATCH
test('returns 404 on patching non-existent mail (4.8)', async () => {
  await api
    .patch('/api/mails/555')
    .set('Authorization', '1')
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
    .set('Authorization', '1')
    .expect(204);
});

// ❌ 4.10 Invalid mail DELETE
test('returns 404 on deleting non-existent mail (4.10)', async () => {
  await api
    .delete('/api/mails/555')
    .set('Authorization', '1')
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail not found' });
});

// ✅ and then ❌ 4.11 Valid mail GET as Recipient user and then invalid mail GET as 3rd user
test('✅ and then ❌ 4.11 Valid mail GET as Recipient user and then invalid mail GET as 3rd user', async () => {
  // 1. Create sender + login
  await api.post('/api/users')
    .send({ firstName: "Sender", lastName: "User", username: "senderX", password: "1234" })
    .expect(201);

  const senderLogin = await api.post('/api/tokens')
    .send({ username: "senderX", password: "1234" })
    .expect(200);

  const senderToken = senderLogin.body.token;

  // 2. Create recipient + login
  await api.post('/api/users')
    .send({ firstName: "Recipient", lastName: "User", username: "recipientX", password: "5678" })
    .expect(201);

  const recipientLogin = await api.post('/api/tokens')
    .send({ username: "recipientX", password: "5678" })
    .expect(200);

  const recipientToken = recipientLogin.body.token;

  // 3. Create unrelated user + login
  await api.post('/api/users')
    .send({ firstName: "Intruder", lastName: "User", username: "intruderX", password: "9999" })
    .expect(201);

  const intruderLogin = await api.post('/api/tokens')
    .send({ username: "intruderX", password: "9999" })
    .expect(200);

  const intruderToken = intruderLogin.body.token;

  // 4. Sender sends mail to recipient
  const mailRes = await api.post('/api/mails')
    .set('Authorization', senderToken)
    .send({
      to: ["recipientX"],
      title: "Private",
      body: "Top Secret"
    })
    .expect(201);

  const mailId = mailRes.body.id;

  // 5. Recipient tries to view the mail – OK
  const resRecipient = await api.get(`/api/mails/${mailId}`)
    .set('Authorization', recipientToken)
    .expect(200);

  // 6. Intruder tries to view the mail – should get 401
  const resIntruder = await api.get(`/api/mails/${mailId}`)
    .set('Authorization', intruderToken)
    .expect(403);

  assert.strictEqual(resIntruder.body.error, "You are not allowed to view this mail");
});

// ❌ 4.12 Recipient tries to edit mail (should return 403 since only sender can edit)
test('❌ Recipient tries to edit mail', async () => {
  // Reuse users from previous test
  const senderLogin = await api.post('/api/tokens')
    .send({ username: "senderX", password: "1234" })
    .expect(200);
  const senderToken = senderLogin.body.token;

  const recipientLogin = await api.post('/api/tokens')
    .send({ username: "recipientX", password: "5678" })
    .expect(200);
  const recipientToken = recipientLogin.body.token;

  // Sender sends new mail
  const mailRes = await api.post('/api/mails')
    .set('Authorization', senderToken)
    .send({
      to: ["recipientX"],
      title: "Another Mail",
      body: "Sender only"
    })
    .expect(201);

  const mailId = mailRes.body.id;

  // Recipient tries to edit the mail
  const res = await api.patch(`/api/mails/${mailId}`)
    .set('Authorization', recipientToken)
    .send({ body: "Should not work" })
    .expect(403);

  assert.strictEqual(res.body.error, "Only the sender can update this mail");
});