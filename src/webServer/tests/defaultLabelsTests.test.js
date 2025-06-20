
// todo add test that mail is assigned to the sender's sent labels
// todo add test that the mail is assigned to the recipient's inbox label
// todo add test that when mail is starred it is assigned to the starred label
// todo add test that drafts are assigned to the drafts label
// todo add test that draft label are unassigned when mail is sent
// todo add test for /api/username/:username route

const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

let sendertoken;
let addresseetoken;
const senderUsername = 'senderUser';
const addresseeUsername = 'addresseeUser';
let mailId;
let labelId;
let nonAttachableLabels;
let spamLabelId;
let trashLabelId;
const securePass = 'aA12345!';

// 0. Setup
test('0. Setup: Register, login, create label and mail', async () => {
  // Register sender user
  await api.post('/api/users').send({
    username: 'senderUser',
    firstName: 'sender',
    lastName: 'User',
    password: securePass
  }).expect(201);

  // Register receipient user
  await api.post('/api/users').send({
    username: 'addresseeUser',
    firstName: 'addressee',
    lastName: 'User',
    password: securePass
  }).expect(201);

  // Login
  const login = await api.post('/api/tokens')
    .send({ username: 'senderUser', password: securePass })
    .expect(201);
  sendertoken = login.body.token;

  // Create label
  const labelRes = await api.post('/api/labels')
    .set('Authorization', 'bearer ' + sendertoken)
    .send({ name: 'Work' })
    .expect(201);
  labelId = labelRes.body.id;

  // Create mail
  const mailRes = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + sendertoken)
    .send({ to: ['addresseeUser'], title: 'Hello', body: 'world' })
    .expect(201);
  mailId = mailRes.body.id;

  // get all labels
  const labelsRes = await api.get('/api/labels')
    .set('Authorization', 'bearer ' + sendertoken)
    .expect(200);

  const labels = labelsRes.body;
  // print the labels for debugging
  console.log('Labels:', labels);
  // find all non attachable labels
  nonAttachableLabels = labels.filter(label => label.isAttachable === false);

  // print the non-attached label for debugging
  console.log('Non-attached label:', nonAttachableLabels);

  trashLabelId = labels.find(label => label.name === 'trash').id;
  spamLabelId = labels.find(label => label.name === 'spam').id;

  console.log('Trash Label ID:', trashLabelId);
  console.log('Spam Label ID:', spamLabelId);

});

// 1. Mail is assigned to sender's sent label
test('1. Mail is assigned to sender\'s sent label', async () => {
  const res = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + sendertoken)
    .send({ to: ['addresseeUser'], title: 'Check Sent', body: 'Hello Sent' })
    .expect(201);

  const sentMailId = res.body.id;

  const mailsBySentLabelRes = await api.get('/api/mails/byLabel/sent')
    .set('Authorization', 'bearer ' + sendertoken)
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
    .set('Authorization', 'bearer ' + sendertoken)
    .send({ to: ['addresseeUser'], title: 'Inbox Check', body: 'Hello inbox' })
    .expect(201);
  const mailId = res.body.id;

  // Login as the recipient
  const login = await api.post('/api/tokens')
    .send({ username: 'addresseeUser', password: securePass })
    .expect(201);
  addresseetoken = login.body.token;

  // get mails by inbox label for the recipient
  const inboxMailsRes = await api.get('/api/mails/byLabel/inbox')
    .set('Authorization', 'bearer ' + addresseetoken)
    .expect(200);

  // check that the mail appears in the inbox label
  assert.ok(
    inboxMailsRes.body.some(mail => mail.id === mailId),
    'Mail should appear in the "inbox" label'
  );
});


// 3. Starring a mail adds it to the starred label
test('3. Starring a mail assigns it to starred label', async () => {
  const res = await api.post('/api/mails')
    .set('Authorization', 'bearer ' + sendertoken)
    .send({ to: ['addresseeUser'], title: 'Star me', body: 'star test' })
    .expect(201);
  const starMailId = res.body.id;

  await api.post(`/api/mails/${starMailId}/starred`)
    .set('Authorization', 'bearer ' + sendertoken)
    .expect(201);

  const labelsRes = await api.get('/api/labels')
    .set('Authorization', 'bearer ' + sendertoken)
    .expect(200);

  const starredLabel = labelsRes.body.find(l => l.name === 'starred');
  assert.ok(starredLabel, 'Starred label should exist');
  assert.ok(starredLabel.mails.includes(starMailId), 'Mail should be in starred label');
});

// 4. Draft mail is labeled as draft
test('4. Draft mail is labeled as draft', async () => {
  const res = await api.post('/api/mails/drafts')
    .set('Authorization', 'bearer ' + sendertoken)
    .send({ to: ['addresseeUser'], title: 'Draft 1', body: 'Unsent' })
    .expect(201);
  const draftMailId = res.body.id;

  const labelsRes = await api.get('/api/labels')
    .set('Authorization', 'bearer ' + sendertoken)
    .expect(200);
  const draftsLabel = labelsRes.body.find(l => l.name === 'drafts');
  assert.ok(draftsLabel, 'Drafts label should exist');
  assert.ok(draftsLabel.mails.includes(draftMailId), 'Draft should be in drafts label');
});

// 5. Draft label removed when draft is sent
test('5. Draft label removed after sending draft', async () => {
  // create a draft mail
  const draftRes = await api.post('/api/mails/drafts')
    .set('Authorization', 'bearer ' + sendertoken)
    .send({ to: ['addresseeUser'], title: 'Send from draft', body: 'go' })
    .expect(201);
  const draftId = draftRes.body.id;

  // send the draft mail
  await api.post(`/api/mails/${draftId}/send`)
    .set('Authorization', 'bearer ' + sendertoken)
    .expect(200);

  const labelsRes = await api.get('/api/labels')
    .set('Authorization', 'bearer ' + sendertoken)
    .expect(200);

  const draftsLabel = labelsRes.body.find(l => l.name === 'drafts');
  assert.ok(draftsLabel, 'Drafts label should exist');
  assert.ok(!draftsLabel.mails.includes(draftId), 'Mail should not be in drafts label after sending');
});

// 6. GET /api/username/:username returns user info
test('6. GET /api/username/:username returns correct user data', async () => {
  const res = await api.get('/api/username/senderUser')
    .set('Authorization', 'bearer ' + sendertoken)
    .expect(200);

  assert.strictEqual(res.body.username, 'senderUser');
  assert.strictEqual(res.body.firstName, 'Test');
  assert.strictEqual(res.body.lastName, 'User');
});

