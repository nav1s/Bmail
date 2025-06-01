const { test } = require('node:test')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

test('full flow: user signup → login → send mail → update → delete → create label', async () => {
  // Sign up
  await api.post('/api/users')
    .send({ firstName: "Alice", lastName: "Jordan", username: "aliceX", password: "pass123" })
    .expect(201);

  // Login
  const loginRes = await api.post('/api/tokens')
    .send({ username: "aliceX", password: "pass123" })
    .expect(200);
  const token = loginRes.body.token;

  // Send mail
  await api.post('/api/users')
    .send({ firstName: "Bob", lastName: "Test", username: "bobX", password: "pass456" })
    .expect(201);

  const mailRes = await api
      .post('/api/mails')
      .set('Authorization', '1')
      .set('Content-Type', 'application/json')
      .send({
        to: ["bobX"],
        title: "Hello again",
        body: "This should work"
      })
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    assert.deepStrictEqual(response.body, {
      from: 1,
      to: [bobX],
      title: "Hello again",
      body: "This should work",
      id: 1
    });

  const mailId = mailRes.body.id;

  // Update mail
  await api.patch(`/api/mails/${mailId}`)
    .set('Authorization', token)
    .send({ title: "Updated title" })
    .expect(200);

  // Delete mail
  await api.delete(`/api/mails/${mailId}`)
    .set('Authorization', token)
    .expect(204);

  // Create label
  const labelRes = await api.post('/api/labels')
    .set('Authorization', token)
    .send({ name: "Work" })
    .expect(201);

  // Delete label
  await api.delete(`/api/labels/${labelRes.body.id}`)
    .set('Authorization', token)
    .expect(204);
});
