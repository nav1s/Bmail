const { test } = require('node:test');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

test('full flow: user signup → login → send mail → update → delete → create label', async () => {
  // Sign up
  await api.post('/api/users')
    .send({ firstName: "Alice", lastName: "Jordan", username: "aliceX", password: "pass123" })
    .expect(201);

  // Login
  const loginRes = await api.post('/api/tokens')
    .send({ username: "aliceX", password: "pass123" })
    .expect(201);
  const token = loginRes.body.token;

  // Create recipient user
  await api.post('/api/users')
    .send({ firstName: "Bob", lastName: "Test", username: "bobX", password: "pass456" })
    .expect(201);

  // Send mail
  const mailRes = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + token)
    .send({
      to: ["bobX"],
      title: "Hello Bob",
      body: "Let's meet"
    })
    .expect(201)
    .catch(err => {
      console.error("Mail send failed:", err.response?.body || err);
      throw err;
    });

  const mailId = mailRes.body.id;

  // Update mail
  await api.patch(`/api/mails/${mailId}`)
    .set('Authorization', 'bearer ' + token)
    .send({ title: "Updated title" })
    .expect(403);

  // Delete mail
  await api.delete(`/api/mails/${mailId}`)
    .set('Authorization', 'bearer ' + token)
    .expect(204);

  // Create label
  const labelRes = await api.post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .send({ name: "Work" })
    .expect(201);

  // Delete label
  await api.delete(`/api/labels/${labelRes.body.id}`)
    .set('Authorization', 'bearer ' + token)
    .expect(204);
});
