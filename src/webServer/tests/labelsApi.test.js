const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');

// Create the test client
const api = supertest(app);

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
}

// ✅ 4.11 - Valid label creation
test('4.11 Valid label create', async () => {
  await createTestUserAndReturn();

  const response = await api
    .post('/api/labels')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({ name: "Important" })
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.id, 1);
  assert.strictEqual(response.body.name, "Important");
});

// ✅ 4.12 - Valid label GET by id
test('4.12 Valid label GET by id', async () => {
  // user already created and label 1 exists from previous test

  const response = await api
    .get('/api/labels/1')
    .set('Authorization', '1')
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
    .set('Authorization', '1')
    .expect(404)
    .expect('Content-Type', /application\/json/)
    .expect({ error: "Label not found" });
});

// ✅ 4.14 - Valid label PATCH by id
test('4.14 Valid label PATCH by id', async () => {
  const response = await api
    .patch('/api/labels/1')
    .set('Authorization', '1')
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
    .set('Authorization', '1')
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
    .set('Authorization', '1')
    .expect(204);
});

// ✅ 4.17 - Valid GET all labels
test('4.17 Valid GET all labels', async () => {
  // Re-create a label so GET all labels returns something
  await api
    .post('/api/labels')
    .set('Authorization', '1')
    .set('Content-Type', 'application/json')
    .send({ name: "Recreated Label" })
    .expect(201);

  const response = await api
    .get('/api/labels')
    .set('Authorization', '1')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  // Response body should be an array containing at least the recreated label
  assert(Array.isArray(response.body));
  assert(response.body.some(label => label.name === "Recreated Label"));
});
