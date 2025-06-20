const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const { title } = require('node:process');

// Create the test client
const api = supertest(app);

let token = ''

// Create test user and return its data including id (assuming first user will get id=1)
async function createTestUserAndReturn() {
  await api
    .post('/api/users')
    .send({
      firstName: "Alice",
      lastName: "Test",
      username: "alice123",
      password: "Securepass1234!"
    })
    .set('Content-Type', 'application/json')
    .expect(201)
    // .expect('location', /\/api\/users\/1/);
  
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
    .send({ username: 'alice123', password: 'Securepass1234!' })
    .expect(201)

  token = loginResponse.body.token;
}

// ✅ 4.11 - Valid label creation
test('4.11 Valid label create', async () => {
  await createTestUserAndReturn();

  let response = await api
    .post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "Important" })
    .expect(201)
    .expect('Content-Type', /application\/json/);
  assert.strictEqual(response.body.name, "Important");

  let labelId = response.body.id;
  response = await api
    .get('/api/labels/' + labelId)
    .set('Authorization', 'bearer ' + token)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.name, "Important");
  assert.strictEqual(response.body.id, labelId);

  response = await api
    .post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "Too Important" })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.name, "Too Important");

  labelId = response.body.id;
  response = await api
    .get('/api/labels/' + labelId)
    .set('Authorization', 'bearer ' + token)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  assert.strictEqual(response.body.name, "Too Important");
  assert.strictEqual(response.body.id, labelId);
});

// ❌ 4.13 - Invalid label GET by id
test('4.13 invalid label GET by id', async () => {
  await api
    .get('/api/labels/999')
    .set('Authorization', 'bearer ' + token)
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: "Label not found" });
});

// ✅ 4.14 - Valid label PATCH by id - not default label
test('4.14 Valid label PATCH by id', async () => {
  // first get the label with name "Too Important" to get its ID
  const getResponse = await api
    .get('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  const label = getResponse.body.find(label => label.name === "Too Important");
  console.log("Labels available:", getResponse.body);
  const labelId = label.id;
  console.log("Label ID to update:", labelId);

  const response = await api
    .patch('/api/labels/' + labelId)
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "Very Important" })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  // owner field expected here
  assert.strictEqual(response.body.id, labelId);
  assert.strictEqual(response.body.name, "Very Important");
});

// ❌ 4.15 - Invalid label PATCH by id
test('4.15 invalid label PATCH by id', async () => {
  await api
    .patch('/api/labels/555')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "NewName" })
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: "Label not found" });
});

// ✅ 4.16 - Valid label DELETE by id
test('4.16 Valid label DELETE by id', async () => {
  // first get the label with name "Too Important" to get its ID
  const getResponse = await api
    .get('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .expect(200)
    .expect('Content-Type', /application\/json/);
  console.log("Labels available:", getResponse.body);

  const label = getResponse.body.find(label => label.name === "Very Important");
  const labelId = label.id;

  console.log("Label ID to update:", labelId);

  await api
    .delete('/api/labels/' + labelId)
    .set('Content-Type', 'application/json')
    .set('Authorization', 'bearer ' + token)
    .expect(204);
});

// ✅ 4.17 - Valid GET all labels
test('4.17 Valid GET all labels', async () => {
  // Re-create a label so GET all labels returns something
  await api
    .post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "Recreated Label" })
    .expect(201);

  const response = await api
    .get('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  // Response body should be an array containing at least the recreated label
  assert(Array.isArray(response.body));
  assert(response.body.some(label => label.name === "Recreated Label"));
});

// ❌ 4.18 - Invalid Try to create duplicate label (should return 400)
test('❌ 4.18 Try to create duplicate label (should return 400)', async () => {
    // First create a label
    const response = await api
    .post('/api/labels/')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'bearer ' + token) 
    .send({ name: "Important" })
    .expect(400)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.error, "Label with this name already exists");
});

// ✅ 4.19 - Check default labels exist for new user
test('4.19 Default labels (Starred, Drafts) should exist', async () => {
  const response = await api
    .get('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .expect(200);

  const names = response.body.map(label => label.name.toLowerCase());
  assert.ok(names.includes("drafts"));
  assert.ok(names.includes("starred"));
});

// ✅ 4.20 - Create mail with default label and fetch by label
test('4.20 Create mail with label and fetch by label', async () => {
  // Get labelId of "Drafts"
  const res = await api
    .get('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .expect(200);

  const draftsLabel = res.body.find(l => l.name.toLowerCase() === "drafts");
  assert.ok(draftsLabel);
  const labelId = draftsLabel.id;

  // Create mail with that label
  const mailRes = await api
    .post('/api/mails')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({
      to: ['alice123'],
      title: 'Draft Mail',
      body: 'This is a draft email',
      labels: [labelId]
    })
    .expect(201);

  const mailId = mailRes.body.id;

  // Fetch mails by label
  const byLabelRes = await api
    .get(`/api/mails/byLabel/drafts`)
    .set('Authorization', 'bearer ' + token)
    .expect(200)

  // log the mails returned by label
  console.log("Mails by label:", byLabelRes.body);

  assert.ok(Array.isArray(byLabelRes.body));
  assert.ok(byLabelRes.body.some(mail => mail.id === mailId));
});

// ✅ 4.21 - if more than 50 mails exist, only 50 latest are returned
test('4.21 GET /api/mails/byLabel returns only last 50 mails', async () => {
  const labelRes = await api
    .post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .send({ name: "OverflowLabel" })
    .expect(201);

  const labelId = labelRes.body.id;

  // Create 55 mails with this label
  for (let i = 1; i <= 55; i++) {
    await api
      .post('/api/mails')
      .set('Authorization', 'bearer ' + token)
      .send({
        to: ['alice123'],
        title: `Overflow mail ${i}`,
        body: 'This is mail number ' + i,
        labels: [labelId]
      })
      .expect(201);
  }

  const res = await api
    .get(`/api/mails/byLabel/${labelId}`)
    .set('Authorization', 'bearer ' + token)
    .expect(200);

  assert.strictEqual(res.body.length, 50);
  // Check that the first mail is the latest one
});

// ❌ 4.23 - GET /api/mails/byLabel/:label returns 404 if label doesn't exist
test('4.23 GET /api/mails/byLabel/:label returns 404 for invalid label', async () => {
  const res = await api
    .get('/api/mails/byLabel/999999') // label ID that doesn't exist
    .set('Authorization', 'bearer ' + token)
    .expect(404);

  assert.strictEqual(res.body.error.toLowerCase(), "label not found");
});
