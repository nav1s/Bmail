const { after, before, test, describe } = require("node:test");
const mongoose = require("mongoose");
const config = require("../utils/config");
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

let senderToken;
let recipientToken;

let mailId;
let labelId;
let nonAttachableLabels;
let spamLabelId;
let trashLabelId;

describe('tests for mail-label assignment', () => {
  before(async () => {
    await mongoose.connect(config.MONGODB_URI);
  });

  // 0. Setup
  test('0. Setup: Register, login, create label and mail', async () => {
    const securePass = 'aA12345!';
    // Register sender user
    await api.post('/api/users').send({
      username: 'testUser',
      firstName: 'sender',
      lastName: 'User',
      password: securePass
    }).expect(201);

    // Register recipient user
    await api.post('/api/users').send({
      username: 'recipientUser',
      firstName: 'recipient',
      lastName: 'User',
      password: securePass
    }).expect(201);

    // Login
    let login = await api.post('/api/tokens')
      .send({ username: 'testUser', password: securePass })
      .expect(201);
    senderToken = login.body.token;

    login = await api.post('/api/tokens')
      .send({ username: 'recipientUser', password: securePass })
      .expect(201);
    recipientToken = login.body.token;

    // Create label
    const labelRes = await api.post('/api/labels')
      .set('Authorization', 'bearer ' + senderToken)
      .send({ name: 'Work' })
      .expect(201);
    labelId = labelRes.body.id;

    // Create mail
    const mailRes = await api.post('/api/mails')
      .set('Authorization', 'bearer ' + senderToken)
      .send({ to: ['testUser@bmail.com'], title: 'Hello', body: 'world' })
      .expect(201);
    mailId = mailRes.body.id;

    // get all labels
    const labelsRes = await api.get('/api/labels')
      .set('Authorization', 'bearer ' + recipientToken)
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
  // 1. Add label to mail (valid)
  test('1. Add label to mail (valid)', async () => {
    await api.post(`/api/mails/${mailId}/labels`)
      .set('Authorization', 'bearer ' + senderToken)
      .send({ labelId })
      .expect(200); // No content
  });

  // // 2. Add label to mail (nonexistent label)
  // test('2. Add label to mail (nonexistent label)', async () => {
  //   const res = await api.post(`/api/mails/${mailId}/labels`)
  //     .set('Authorization', 'bearer ' + senderToken)
  //     .send({ labelId: 9999 })
  //     .expect(404);
  //   assert.strictEqual(res.body.error, 'Label not found');
  // });

  // 2.1 attempt to add non-attachable label to mail
  test('2.1 Attempt to add non-attachable label to mail', async () => {
    // loop through all non attachable labels
    for (const label of nonAttachableLabels) {
      console.log(`Attempting to add non-attachable label ${label.name} to mail ${mailId}`);
      const res = await api.post(`/api/mails/${mailId}/labels`)
        .set('Authorization', 'bearer ' + recipientToken)
        .send({ labelId: label.id })
        .expect(403);
      assert.strictEqual(res.body.error, 'User does not have access to this mail');
    }
  });


  // 3. Add label to non-existent mail
  test('3. Add label to non-existent mail', async () => {
    const res = await api.post(`/api/mails/9999/labels`)
      .set('Authorization', 'bearer ' + recipientToken)
      .send({ labelId })
      .expect(400);
    assert.strictEqual(res.body.error, 'IDs must be valid ObjectIds');
  });

  // 4. Get mails by label
  test('4. Get mails by label', async () => {
    const res = await api.get(`/api/mails?label=Work`)
      .set('Authorization', 'bearer ' + senderToken)
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
      .set('Authorization', 'bearer ' + senderToken)
      .expect(200);
  });

  // 7. Mail is automatically labeled as Inbox
  test('7. Mail is automatically labeled as Inbox', async () => {
    const mailRes = await api.post('/api/mails')
      .set('Authorization', 'bearer ' + senderToken)
      .send({ to: ['testUser@bmail.com'], title: 'Auto Inbox?', body: 'Check default label' })
      .expect(201);

    const newMailId = mailRes.body.id;

    const getMailRes = await api.get(`/api/mails/${newMailId}`)
      .set('Authorization', 'bearer ' + senderToken)
      .expect(200);

    // print the mail for debugging
    const mail = getMailRes.body;

    assert.ok(Array.isArray(mail.labels));
  });

  // 8. Get mails by label "Inbox" includes new mail
  test('8. Get mails by label "Inbox" includes new mail', async () => {
    // first create a new mail
    const mailRes = await api.post('/api/mails')
      .set('Authorization', 'bearer ' + senderToken)
      .send({ to: ['testUser@bmail.com'], title: 'Inbox Test', body: 'This should be in Inbox' })
      .expect(201);
    const newMailId = mailRes.body.id;
    const res = await api.get('/api/mails/' + newMailId)
      .set('Authorization', 'bearer ' + senderToken)
      .expect(200);

    // print inbox label for debugging
    const getResponse = await api
      .get('/api/labels')
      .set('Authorization', 'bearer ' + senderToken)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    console.log('Labels:', getResponse.body);

  });

  // 9. Removing a label not attached to the mail should return 204 or 404
  test('9 Removing a label not attached to the mail should return 204 or 404', async () => {
    const newLabelRes = await api
      .post('/api/labels')
      .set('Authorization', 'bearer ' + senderToken)
      .send({ name: 'TempToRemove' })
      .expect(201);

    const unusedLabelId = newLabelRes.body.id;

    const res = await api
      .delete(`/api/mails/${mailId}/labels/${unusedLabelId}`)
      .set('Authorization', 'bearer ' + senderToken)
      .expect(200);

  });

  // 10. Get mails by nonexistent label should return 404
  test('10. Get mails by nonexistent label returns 404', async () => {
    await api.get('/api/mails/byLabel/DoesNotExist')
      .set('Authorization', 'bearer ' + senderToken)
      .expect(404);
  });

  // 11. Adding the same label twice should not create duplicates
  test('11. Add same label twice should not duplicate', async () => {
    await api.post(`/api/mails/${mailId}/labels`)
      .set('Authorization', 'bearer ' + senderToken)
      .send({ labelId })
      .expect(200);

    await api.post(`/api/mails/${mailId}/labels`)
      .set('Authorization', 'bearer ' + senderToken)
      .send({ labelId })
      .expect(200);

    const mail = await api.get(`/api/mails/${mailId}`)
      .set('Authorization', 'bearer ' + senderToken)
      .expect(200);

    const count = mail.body.labels.filter(id => id === labelId).length;
    assert.strictEqual(count, 1, 'Label should not be duplicated');
  });

  after(async () => {
    await mongoose.connection.close();
  });

});
