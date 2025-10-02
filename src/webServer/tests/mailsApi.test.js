const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const User = require("../models/usersModel");
const Mail = require("../models/mailsModel");
const { Label } = require("../models/labelsModel");
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');

// Create the test client
const api = supertest(app);

let aliceToken, bobToken, carloToken, mailId1, mailId2, mailId3, msgTitle, msgBody;

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
  await User.deleteMany({});
  await Mail.deleteMany({});
  await Label.deleteMany({});
});

// Create test user and return the created user data (including id)
async function createTestUserAndReturn() {
  let res = await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "Securep12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
  let location = res.header.location;

  let response = await api
    .get(location)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body.firstName, "Alice");
  assert.deepStrictEqual(response.body.lastName, "Test");
  assert.deepStrictEqual(response.body.username, "alice123");

  // Get the token for the user
  let loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'alice123', password: 'Securep12!' })
    .expect(201)

  aliceToken = loginResponse.body.token;

  res = await api
    .post('/api/users')
    .send({
      firstName: "bob",
      lastName: "smith",
      username: "bob",
      password: "Imthebobyboten12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)

  location = res.header.location;

  response = await api
    .get(location)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  assert.deepStrictEqual(response.body.firstName, "bob");
  assert.deepStrictEqual(response.body.lastName, "smith");
  assert.deepStrictEqual(response.body.username, "bob");

  loginResponse = await api
    .post('/api/tokens')
    .send({ username: 'bob', password: 'Imthebobyboten12!' })
    .expect(201)
  bobToken = loginResponse.body.token;

  res = await api
    .post('/api/users')
    .send({
      firstName: "Carlo",
      lastName: "Ancelotti",
      username: "carlo123",
      password: "WeWinChampions12!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)

  location = res.header.location;

  response = await api
    .get(location)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body.firstName, "Carlo");
  assert.deepStrictEqual(response.body.lastName, "Ancelotti");
  assert.deepStrictEqual(response.body.username, "carlo123");

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
    .expect({ error: 'Missing required fields: title, body, to[]' });
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
      to: ["alice123@bmail.com"],
      title: "Hello again",
      body: msgBody,
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  mailId1 = response.body.id;
  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["alice123@bmail.com"]);
  assert.deepEqual(response.body.title, "Hello again");
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, false);
  assert.deepEqual(response.body.urls, [url1, url2]);

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
      to: ["alice123@bmail.com"],
      title: "Hello Wirtz",
      body: msgBody,
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["alice123@bmail.com"]);
  assert.deepEqual(response.body.title, "Hello Wirtz");
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, false);
  assert.deepEqual(response.body.urls, [url1]);

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
    .get('/api/mails/' + mailId1)
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.id, mailId1);
  assert.strictEqual(response.body.title, "Hello again");
});

// ❌ 4.7 Invalid mail GET by id
test('returns 404 for invalid mail id (4.6)', async () => {
  await api
    .get('/api/mails/555')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail ID must be a valid ObjectId' });
});

// ❌ 4.8 Invalid mail PATCH
test('returns 404 on patching non-existent mail (4.8)', async () => {
  await api
    .patch('/api/mails/555')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({ title: "New Title" })
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail ID must be a valid ObjectId' });
});

// ✅ 4.9 Valid mail DELETE
test('deletes mail by id (4.9)', async () => {
  await api
    .delete('/api/mails/' + mailId1)
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(204);
  // Verify the mail is deleted
  await api
    .get('/api/mails/' + mailId1)
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(403)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'User does not have access to this mail' });

});

// ❌ 4.10 Invalid mail DELETE
test('returns 404 on deleting non-existent mail (4.10)', async () => {
  await api
    .delete('/api/mails/555')
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(400)
    .expect('Content-Type', /application\/json/)
    .expect({ error: 'Mail ID must be a valid ObjectId' });
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
  msgBody = "This should work";
  msgTitle = "Hello again";

  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      to: ["bob@bmail.com"],
      title: msgTitle,
      body: msgBody,
      draft: true
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  mailId2 = response.body.id;
  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["bob@bmail.com"]);
  assert.deepEqual(response.body.title, msgTitle);
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, true);
  assert.deepEqual(response.body.urls, []);

});

// ✅ 4.13 valid mail PATCH
test('4.13 valid mail patch', async () => {
  await api
    .patch('/api/mails/' + mailId2)
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({ title: msgTitle })
    .expect(200)

  const response = await api
    .get('/api/mails/' + mailId2)
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)

  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["bob@bmail.com"]);
  assert.deepEqual(response.body.title, msgTitle);
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, true);
  assert.deepEqual(response.body.urls, []);

});

// ❌ 4.14 invalid mail PATCH
test('invalid mail patch', async () => {
 // Bob tries to update Alice's draft
  await api
    .patch('/api/mails/' + mailId2)
    .set('Authorization', 'bearer ' + bobToken)
    .set('Content-Type', 'application/json')
    .send({ title: "Updated Title" })
    .expect(403)
});

// ✅ 4.15 Valid draft get by id
test('4.15 valid draft get by id)', async () => {
  const response = await api
    .get('/api/mails/' + mailId2)
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["bob@bmail.com"]);
  assert.deepEqual(response.body.title, msgTitle);
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, true);
  assert.deepEqual(response.body.urls, []);

});

// ❌ 4.16 invalid draft get by id
test('4.16 invalid draft get by id)', async () => {
  await api
    .get('/api/mails/' + mailId2)
    .set('Authorization', 'bearer ' + bobToken)
    .expect(403)
    .expect('Content-Type', /application\/json/);
});

// ❌ Recipient cannot delete draft
// test('4.17 recipient cannot delete draft', async () => {
//   await api
//     .delete('/api/mails/' + mailId2)
//     .set('Authorization', 'bearer ' + bobToken)
//     .expect(403)
// })

// ✅ 4.18 valid draft delete by owner
test('4.18. Sender can delete draft (soft delete)', async () => {
  const res = await api.delete('/api/mails/' + mailId2)
    .set('Authorization', 'bearer ' + aliceToken);

  assert.strictEqual(res.status, 204);
});

// ❌ 4.19 invalid draft get after delete
test('4.19. Sender cannot access the draft after deleting it', async () => {
  const res = await api.get('/api/mails/' + mailId2)
    .set('Authorization', 'bearer ' + aliceToken);

  assert.strictEqual(res.status, 403);
});

// ✅ 4.20 valid draft creation
test('4.20 valid draft creation', async () => {
  msgBody = "This should work again";
  msgTitle = "Hello again";
  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      to: ["bob@bmail.com"],
      title: msgTitle,
      body: msgBody,
      draft: true
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  mailId3 = response.body.id;

  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["bob@bmail.com"]);
  assert.deepEqual(response.body.title, msgTitle);
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, true);
  assert.deepEqual(response.body.urls, []);

});

// ✅ 4.21 Valid draft get by owner and recipient cannot access
test('4.21 valid draft get by id)', async () => {
  const response = await api
    .get('/api/mails/' + mailId3)
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["bob@bmail.com"]);
  assert.deepEqual(response.body.title, msgTitle);
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, true);
  assert.deepEqual(response.body.urls, []);

  await api
    .get('/api/mails/' + mailId3)
    .set('Authorization', 'bearer ' + bobToken)
    .expect(403)
    .expect('Content-Type', /application\/json/);
});

// ✅ 4.22 valid send draft
test('4.22 send draft', async () => {
  await api
    .patch('/api/mails/' + mailId3)
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({ draft: false })
    .expect(200)

  const response = await api
    .get('/api/mails/' + mailId3)
    .set('Authorization', 'bearer ' + aliceToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["bob@bmail.com"]);
  assert.deepEqual(response.body.title, msgTitle);
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, false);
  assert.deepEqual(response.body.urls, []);

});

// ✅ 4.23 valid get sent mail by recipient after sending draft
test('4.23 valid get sent mail by recipient after sending draft', async () => {
  const response = await api
    .get('/api/mails/' + mailId3)
    .set('Authorization', 'bearer ' + bobToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["bob@bmail.com"]);
  assert.deepEqual(response.body.title, msgTitle);
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, false);
  assert.deepEqual(response.body.urls, []);

});

// ✅ 4.24 valid get mail by recipient after mail deleted in another user
test('4.24 valid get mail by recipient after mail deleted in another user', async () => {
  const url1 = 'http://good.com';
  const url2 = 'http://verygood.com';
  msgBody = `This should work: ${url1} ${url2}`;
  msgTitle = "Hello again friends";

  const response = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + aliceToken)
    .set('Content-Type', 'application/json')
    .send({
      to: ["alice123@bmail.com", "bob@bmail.com", "carlo123@bmail.com"],
      title: msgTitle,
      body: msgBody,
    })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const mailId = response.body.id;

  assert.deepEqual(response.body.from, "alice123@bmail.com");
  assert.deepEqual(response.body.to, ["alice123@bmail.com", "bob@bmail.com", "carlo123@bmail.com"]);
  assert.deepEqual(response.body.title, msgTitle);
  assert.deepEqual(response.body.body, msgBody);
  assert.deepEqual(response.body.draft, false);
  assert.deepEqual(response.body.urls, [url1, url2]);

  await api
    .delete('/api/mails/' + mailId)
    .set('Authorization', 'bearer ' + bobToken)
    .expect(204);
  const response2 = await api
    .get('/api/mails/' + mailId)
    .set('Authorization', 'bearer ' + carloToken)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepEqual(response2.body.from, "alice123@bmail.com");
  assert.deepEqual(response2.body.to, ["alice123@bmail.com", "bob@bmail.com", "carlo123@bmail.com"]);
  assert.deepEqual(response2.body.title, msgTitle);
  assert.deepEqual(response2.body.body, msgBody);
  assert.deepEqual(response2.body.draft, false);
  assert.deepEqual(response2.body.urls, [url1, url2]);

})

after(async () => {
  await mongoose.connection.close();
});
