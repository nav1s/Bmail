const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');

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
      password: "securepass"
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
    .send({ username: 'alice123', password: 'securepass' })
    .expect(201)

  token = loginResponse.body.token;
}

// ✅ 4.11 - Valid label creation
test('4.11 Valid label create', async () => {
  await createTestUserAndReturn();

  const response = await api
    .post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "Important" })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.id, 1);
  assert.strictEqual(response.body.name, "Important");

  const response2 = await api
    .post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "Too Important" })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response2.body.id, 2);
  assert.strictEqual(response2.body.name, "Too Important");
});

// ✅ 4.12 - Valid label GET by id
test('4.12 Valid label GET by id', async () => {
  // user already created and label 1 exists from previous test

  const response = await api
    .get('/api/labels/1')
    .set('Authorization', 'bearer ' + token)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(response.body, {
    id: 1,
    name: "Important"
  });
});

// ✅ ❌ 4.13 - Invalid label GET by id
test('4.13 invalid label GET by id', async () => {
  await api
    .get('/api/labels/5')
    .set('Authorization', 'bearer ' + token)
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: "Label not found" });
});

// ✅ 4.14 - Valid label PATCH by id
test('4.14 Valid label PATCH by id', async () => {
  const response = await api
    .patch('/api/labels/1')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "Very Important" })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  // owner field expected here
  assert.strictEqual(response.body.id, 1);
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
  await api
    .delete('/api/labels/1')
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
test('❌ Try to create duplicate label (should return 400)', async () => {
    // First create a label
    const response = await api
    .post('/api/labels')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'bearer ' + token) 
    .send({ name: "Important" })
    .expect(201)
    .expect('Content-Type', /application\/json/);


  assert.strictEqual(response.body.id, 4);
  assert.strictEqual(response.body.name, "Important");

  // Try to create another label with the same name
  // This should return 400 since the label already exists
  const response2 = await api
    .post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .set('Content-Type', 'application/json')
    .send({ name: "Important" })
    .expect(400)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response2.body.error, "Label with this name already exists");
});
