const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

let token;
let mailId;
let labelId;

// 0. Setup
test('0. Setup: Register, login, create label and mail', async () => {
  const securePass = 'aA12345!';
  // Register user
  await api.post('/api/users').send({
    username: 'testUser',
    firstName: 'Test',
    lastName: 'User',
    password: securePass
  }).expect(201);

  // Login
  const login = await api.post('/api/tokens')
    .send({ username: 'testUser', password: securePass })
    .expect(201);
  token = login.body.token;

  // Create label
  const labelRes = await api.post('/api/labels')
    .set('Authorization', 'bearer ' + token)
    .send({ name: 'Work' })
    .expect(201);
  labelId = labelRes.body.id;

  // Create mail
  const mailRes = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + token)
    .send({ to: ['testUser'], title: 'Hello', body: 'world' })
    .expect(201);
  mailId = mailRes.body.id;
});

// 1. Add label to mail (valid)
test('1. Add label to mail (valid)', async () => {
  await api.post(`/api/mails/${mailId}/labels`)
    .set('Authorization', 'bearer ' + token)
    .send({ labelId })
    .expect(204); // No content
});

// 2. Add label to mail (nonexistent label)
test('2. Add label to mail (nonexistent label)', async () => {
  const res = await api.post(`/api/mails/${mailId}/labels`)
    .set('Authorization', 'bearer ' + token)
    .send({ labelId: 9999 })
    .expect(404);
  assert.strictEqual(res.body.error, 'Label not found');
});

// 3. Add label to non-existent mail
test('3. Add label to non-existent mail', async () => {
  const res = await api.post(`/api/mails/9999/labels`)
    .set('Authorization', 'bearer ' + token)
    .send({ labelId })
    .expect(404);
  assert.strictEqual(res.body.error, 'Mail not found');
});

// 4. Get mails by label
test('4. Get mails by label', async () => {
  const res = await api.get(`/api/mails?label=Work`)
    .set('Authorization', 'bearer ' + token)
    .expect(200);

  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.some(m => m.id === mailId));
});

// 5. Cannot remove label from mail not owned
test('5. Cannot remove label from mail not owned', async () => {
  // Create another user
  await api.post('/api/users').send({
    username: 'other',
    firstName: 'Other',
    lastName: 'User',
    password: 'Securepass1!'
  }).expect(201);

  const login = await api.post('/api/tokens')
    .send({ username: 'other', password: 'Securepass1!' })
    .expect(201);
  const otherToken = login.body.token;

  await api.delete(`/api/mails/${mailId}/labels/${labelId}`)
    .set('Authorization', 'bearer ' + otherToken)
    .expect(403);
});

// 6. Remove label from mail (valid)
test('6. Remove label from mail (valid)', async () => {
  await api.delete(`/api/mails/${mailId}/labels/${labelId}`)
    .set('Authorization', 'bearer ' + token)
    .expect(204);
});

// 7. Mail is automatically labeled as Inbox
test('7. Mail is automatically labeled as Inbox', async () => {
  const mailRes = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + token)
    .send({ to: ['testUser'], title: 'Auto Inbox?', body: 'Check default label' })
    .expect(201);

  const newMailId = mailRes.body.id;

  const getMailRes = await api.get(`/api/mails/${newMailId}`)
    .set('Authorization', 'bearer ' + token)
    .expect(200);

  // print the mail for debugging
  const mail = getMailRes.body;
  console.log('Test 7 here is the mail: ' + mail.body);
  assert.ok(Array.isArray(mail.labels));
  assert.ok(mail.labels.some(label => label.name === 'Inbox'), 'Mail should be labeled as Inbox by default');
});

// 8. Get mails by label "Inbox" includes new mail
test('8. Get mails by label "Inbox" includes new mail', async () => {
  const res = await api.get('/api/mails?label=Inbox')
    .set('Authorization', 'bearer ' + token)
    .expect(200);

  const newMailId = res.body.id;

  const getMailRes = await api.get(`/api/mails/${newMailId}`)
    .set('Authorization', 'bearer ' + token)
    .expect(200);
  
  // print the mail for debugging
  const mail = getMailRes.body;
  console.log('Test 8 here is the mail: ' + mail.body);
  const inboxMails = res.body;
  assert.ok(Array.isArray(inboxMails));
  assert.ok(inboxMails.some(m => m.title === 'Auto Inbox?'), 'Expected mail not found in Inbox label');
});

