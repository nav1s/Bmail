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

let nonAttachableLabels, trashLabelId, token, mailId

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
  await User.deleteMany({});
  await Mail.deleteMany({});
  await Label.deleteMany({});
});

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
    console.log("token: " + token)

    // Create mail
    const mailRes = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Hello', body: 'world' })
        .expect(201);
    mailId = mailRes.body.id;

    // get all labels
    const labelsRes = await api.get('/api/labels')
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    const labels = labelsRes.body;
    // print the labels for debugging
    console.log('Labels:', labels);
    // find all non attachable labels
    nonAttachableLabels = labels.filter(label => label.isAttachable === false);

    // print the non-attached label for debugging
    console.log('Non-attached label:', nonAttachableLabels);

    trashLabelId = labels.find(label => label.name === 'trash').id;

    console.log('Trash Label ID:', trashLabelId);
});


// add trash label to mail
test('Add trash label to mail', async () => {
    await api.post(`/api/mails/${mailId}/labels`)
        .set('Authorization', 'bearer ' + token)
        .send({ labelId: trashLabelId })
        .expect(200);

    // Verify the mail has the trash label
    const mailRes = await api.get(`/api/mails/${mailId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    const mail = mailRes.body;
    console.log('Mail after adding trash label:', mail);
    console.log('Mail labels:', mail.labels);
    // log the trash label ID for debugging
    console.log('trash Label ID:', trashLabelId);
    // check if the mail has the trash label
    assert(mail.labels.includes(trashLabelId), 'Mail should have trash label');
});

// list inbox should not include trash mails
test('List inbox should not include trash mails', async () => {
    const res = await api.get('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    const mails = res.body;
    console.log('Mails in inbox:', mails);
    // check if the mail is in the inbox
    assert(!mails.some(mail => mail.id === mailId),
    'Inbox should not include trash mails');
});

// list mails by trash label should include the mail
test('List mails by trash label should include the mail', async () => {
    const res = await api.get('/api/mails/byLabel/trash')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    const mails = res.body;
    console.log('Mails in trash label:', mails);
    // check if the mail is in the trash label
    assert(mails.some(mail => mail.id === mailId),
    'trash label should include the mail');
});

// remove trash label from mail
test('Remove trash label from mail', async () => {
    await api.delete(`/api/mails/${mailId}/labels/${trashLabelId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    // Verify the mail has no trash label
    const mailRes = await api.get(`/api/mails/${mailId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    const mail = mailRes.body;
    console.log('Mail after removing trash label:', mail);
    // check if the mail has no trash label
    assert(!mail.labels.includes(trashLabelId), 'Mail should not have trash label');
});

// list inbox should include the mail again
test('List inbox should include the mail again', async () => {
    const res = await api.get('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    const mails = res.body;
    console.log('Mails in inbox after removing trash label:', mails);
    // check if the mail is in the inbox
    assert(mails.some(mail => mail.id === mailId), 'Inbox should include the mail again');
});

// list mails by trash label should not include the mail
test('List mails by trash label should not include the mail', async () => {
    const res = await api.get('/api/mails/byLabel/trash')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    const mails = res.body;
    console.log('Mails in trash label after removing trash label:', mails);
    // check if the mail is not in the trash label
    assert(!mails.some(mail => mail.id === mailId), 'trash label should not include the mail');
});

 after(async () => {
   await mongoose.connection.close();
 });
