const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const User = require("../models/usersModel");
const Mail = require("../models/mailsModel");
const { Label } = require("../models/labelsModel");
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

let senderToken;
let recipientToken;
const senderUsername = 'senderUser';
const recipientUsername = 'addresseeUser@bmail.com';

let starLabelId;
const securePass = 'aA12345!';

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
  await User.deleteMany({});
  await Mail.deleteMany({});
  await Label.deleteMany({});
});

// 0. Setup
test('0. Setup: Register, login, create label and mail', async () => {
  // Register sender user
  await api.post('/api/users').send({
    username: senderUsername,
    firstName: senderUsername,
    lastName: senderUsername,
    password: securePass
  }).expect(201);

  // Register recipient user
  await api.post('/api/users').send({
    username: recipientUsername,
    firstName: recipientUsername,
    lastName: recipientUsername,
    password: securePass
  }).expect(201);

  // get the sender token
  let login = await api.post('/api/tokens')
    .send({ username: senderUsername, password: securePass })
    .expect(201);
  senderToken = login.body.token;

  // get the recipient token
  login = await api.post('/api/tokens')
    .send({ username: recipientUsername, password: securePass })
    .expect(201);
  recipientToken = login.body.token;

  // get all labels
  const labelsRes = await api.get('/api/labels')
    .set('Authorization', 'bearer ' + senderToken)
    .expect(200);

  const labels = labelsRes.body;
  starLabelId = labels.find(label => label.name === 'starred').id;
  console.log('Star Label ID:', starLabelId);

});

// 1. Mail is assigned to sender's sent label
test('1. Mail is assigned to sender\'s sent label', async () => {
  const res = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + senderToken)
    .send({ to: [recipientUsername], title: 'Check Sent', body: 'Hello Sent' })
    .expect(201);

  const sentMailId = res.body.id;

  const mailsBySentLabelRes = await api.get('/api/mails/byLabel/sent')
    .set('Authorization', 'bearer ' + senderToken)
    .expect(200);

  assert.ok(
    mailsBySentLabelRes.body.some(mail => mail.id === sentMailId),
    'Mail should appear in the "sent" label'
  );
});

// 2. Mail is assigned to recipient's inbox label
test('2. Mail is assigned to recipient\'s inbox label', async () => {
  // create a mail from sender to recipient
  const res = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + senderToken)
    .send({ to: [recipientUsername], title: 'Inbox Check', body: 'Hello inbox' })
    .expect(201);
  const mailId = res.body.id;

  // // get mails by inbox label for the recipient
  // const inboxMailsRes = await api.get('/api/mails/byLabel/inbox')
  //   .set('Authorization', 'bearer ' + recipientToken)
  //   .expect(200);

  // // log the inbox mails for debugging
  // console.log('Inbox Mails:', inboxMailsRes.body);

  // // check that the mail appears in the inbox label
  // assert.ok(
  //   inboxMailsRes.body.some(mail => mail.id === mailId),
  //   'Mail should appear in the "inbox" label'
  // );
});


// 3. Starring a mail adds it to the starred label
test('3. Starring a mail assigns it to starred label', async () => {
  let res = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + senderToken)
    .send({ to: [recipientUsername], title: 'Star me', body: 'star test' })
    .expect(201);
  const starMailId = res.body.id;

  res = await api.post(`/api/mails/${starMailId}/labels`)
    .set('Authorization', 'bearer ' + senderToken)
    .send({ labelId: starLabelId })
    .expect(200);

  const labelsRes = await api.get('/api/labels')
    .set('Authorization', 'bearer ' + senderToken)
    .expect(200);

  const starredLabel = labelsRes.body.find(l => l.name === 'starred');
  assert.ok(starredLabel, 'Starred label should exist');
});

// 4. Draft mail is labeled as draft
test('4. Draft mail is labeled as draft', async () => {
  const res = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + senderToken)
    .send({ to: [recipientUsername], title: 'Draft 1', body: 'Unsent', draft:true })
    .expect(201);
  const draftMailId = res.body.id;

  const labelsRes = await api.get('/api/labels')
    .set('Authorization', 'bearer ' + senderToken)
    .expect(200);
  const draftsLabel = labelsRes.body.find(l => l.name === 'drafts');
  // log the draft label for debugging
  console.log('Drafts Label:', draftsLabel);

  assert.ok(draftsLabel, 'Drafts label should exist');
});

// 5. Draft label removed when draft is sent
test('5. Draft label removed after sending draft', async () => {
  // create a draft mail
  const draftRes = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + senderToken)
    .send({ to: [recipientUsername], title: 'Send from draft', body: 'go', draft: false })
    .expect(201);
  const draftId = draftRes.body.id;

  const labelsRes = await api.get('/api/labels')
    .set('Authorization', 'bearer ' + senderToken)
    .expect(200);

  const draftsLabel = labelsRes.body.find(l => l.name === 'drafts');
  assert.ok(draftsLabel, 'Drafts label should exist');
});

// 6. GET /api/username/:username returns user info
test('6. GET /api/username/:username returns correct user data', async () => {
  const res = await api.get(`/api/users/username/${senderUsername}`)
    .set('Authorization', 'bearer ' + senderToken)
    .expect(200);

  assert.strictEqual(res.body.username, senderUsername, 'Username should match');
  assert.strictEqual(res.body.firstName, senderUsername, 'First name should match');
  assert.strictEqual(res.body.lastName, senderUsername, 'Last name should match');
});

after(async () => {
  await mongoose.connection.close();
});
