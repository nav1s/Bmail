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

let nonAttachableLabels, spamLabelId, mailId

before(async () => {
  await mongoose.connect(config.MONGODB_URI);
  await User.deleteMany({});
  await Mail.deleteMany({});
  await Label.deleteMany({});
});

/**
 * Utility function to check if a URL is blacklisted via spam mails.
 */
async function isUrlBlacklistedViaSpamMails(url) {
    const res = await api.get('/api/mails/byLabel/spam')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    return res.body.some(mail => mail.body.includes(url));
}

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

    spamLabelId = labels.find(label => label.name === 'spam').id;

    console.log('Spam Label ID:', spamLabelId);

});

// add spam label to mail
test('Add spam label to mail', async () => {
    await api.post(`/api/mails/${mailId}/labels`)
        .set('Authorization', 'bearer ' + token)
        .send({ labelId: spamLabelId })
        .expect(200);

    // Verify the mail has the spam label
    const mailRes = await api.get(`/api/mails/${mailId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    const mail = mailRes.body;
    console.log('Mail after adding spam label:', mail);
    console.log('Mail labels:', mail.labels);
    // log the spam label ID for debugging
    console.log('Spam Label ID:', spamLabelId);
    // check if the mail has the spam label
    assert(mail.labels.includes(spamLabelId), 'Mail should have spam label');
});

// list inbox should not include spam mails
test('List inbox should not include spam mails', async () => {
    const res = await api.get('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    const mails = res.body;
    console.log('Mails in inbox:', mails);
    // check if the mail is in the inbox
    assert(!mails.some(mail => mail.id === mailId),
    'Inbox should not include spam mails');
});

// list mails by spam label should include the mail
test('List mails by spam label should include the mail', async () => {
    const res = await api.get('/api/mails/byLabel/spam')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    const mails = res.body;
    console.log('Mails in spam label:', mails);
    // check if the mail is in the spam label
    assert(mails.some(mail => mail.id === mailId),
    'Spam label should include the mail');
});

// remove spam label from mail
test('Remove spam label from mail', async () => {
    await api.delete(`/api/mails/${mailId}/labels/${spamLabelId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    // Verify the mail has no spam label
    const mailRes = await api.get(`/api/mails/${mailId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    const mail = mailRes.body;
    console.log('Mail after removing spam label:', mail);
    // check if the mail has no spam label
    assert(!mail.labels.includes(spamLabelId), 'Mail should not have spam label');
});

// list inbox should include the mail again
test('List inbox should include the mail again', async () => {
    const res = await api.get('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    const mails = res.body;
    console.log('Mails in inbox after removing spam label:', mails);
    // check if the mail is in the inbox
    assert(mails.some(mail => mail.id === mailId), 'Inbox should include the mail again');
});

// list mails by spam label should not include the mail
test('List mails by spam label should not include the mail', async () => {
    const res = await api.get('/api/mails/byLabel/spam')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    const mails = res.body;
    console.log('Mails in spam label after removing spam label:', mails);
    // check if the mail is not in the spam label
    assert(!mails.some(mail => mail.id === mailId), 'Spam label should not include the mail');
});

// Marking mail as spam adds its URLs to the blacklist
test('Marking mail as spam adds its URLs to the blacklist', async () => {
    let url = 'http://badlink.com';
    // remove the url from the blacklist if it exists
    await api.delete(`/api/blacklist/${encodeURIComponent(url)}`)
        .set('Authorization', 'bearer ' + token)

    const mailBody = `Suspicious link: ${url}`;

    res = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Spam Link', body: mailBody })
        .expect(201);
    const newMailId = res.body.id;

    await api.post(`/api/mails/${newMailId}/labels`)
        .set('Authorization', 'bearer ' + token)
        .send({ labelId: spamLabelId })
        .expect(200);
});


// Removing spam label removes URLs from the blacklist
test('Removing spam label removes URLs from the blacklist', async () => {
    const url = 'http://removeme.com';
    // remove the url from the blacklist if it exists
    await api.delete(`/api/blacklist/${encodeURIComponent(url)}`)
        .set('Authorization', 'bearer ' + token)

    const mailBody = `Another spammy link: ${url}`;

    // create a mail with the spam link
    const res = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Spam Removal', body: mailBody })
        .expect(201);
    const mailId = res.body.id;

    // add the spam label to the mail
    await api.post(`/api/mails/${mailId}/labels`)
        .set('Authorization', 'bearer ' + token)
        .send({ labelId: spamLabelId })
        .expect(200);

    // ensure the url is blacklisted
    isBlacklisted = await isUrlBlacklistedViaSpamMails(url);
    assert(isBlacklisted, 'URL should be blacklisted after mail creation with spam link');

    // remove the spam label
    await api.delete(`/api/mails/${mailId}/labels/${spamLabelId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    // check if the URL is removed from the blacklist
    isBlacklisted = await isUrlBlacklistedViaSpamMails(url);
    assert(!isBlacklisted, 'URL should be removed from blacklist after removing spam label');
});

// Mail with blacklisted URL is automatically marked as spam
test('Mail with blacklisted URL is automatically marked as spam', async () => {
    const blacklistedUrl = 'http://autospam.com';

    // Manually add to blacklist
    await api.post('/api/blacklist')
        .set('Authorization', 'bearer ' + token)
        .send({ url: blacklistedUrl })
        .expect(201);

    // Create mail that contains the blacklisted URL
    const res = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Auto Spam', body: `Hey check this: ${blacklistedUrl}` })
        .expect(201);
    const autoSpamMailId = res.body.id;

    // Get mails by spam label
    const spamMailsRes = await api.get('/api/mails/byLabel/spam')
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    console.log('Spam label mails:', spamMailsRes.body);
    assert(spamMailsRes.body.some(mail => mail.id === autoSpamMailId),
        'Mail with blacklisted URL should be marked as spam automatically');
});

test('Mail removed from spam appears again in inbox', async () => {
    const res = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Test Spam Exit', body: 'http://badlink.com' })
        .expect(201);
    const mailId = res.body.id;

    let spamRes = await api.get('/api/mails/byLabel/spam')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    assert(spamRes.body.some(mail => mail.id === mailId), 'Mail should appear in spam');

    await api.delete(`/api/mails/${mailId}/labels/${spamLabelId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    spamRes = await api.get('/api/mails/byLabel/spam')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    assert(!spamRes.body.some(mail => mail.id === mailId), 'Mail should not appear in spam anymore');

    const inboxRes = await api.get('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .expect(200);
    assert(inboxRes.body.some(mail => mail.id === mailId), 'Mail should appear in inbox again');
});

test('URL remains blacklisted if still present in another spam mail', async () => {
    const url = 'http://sharedlink.com';
    // delete the URL from blacklist if it exists
    await api.delete(`/api/blacklist/${encodeURIComponent(url)}`)
        .set('Authorization', 'bearer ' + token)

    const res1 = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Spam1', body: `link: ${url}` })
        .expect(201);
    const mail1 = res1.body.id;

    const res2 = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Spam2', body: `check this: ${url}` })
        .expect(201);

    await api.post(`/api/mails/${mail1}/labels`)
        .set('Authorization', 'bearer ' + token)
        .send({ labelId: spamLabelId })
        .expect(200);

    await api.delete(`/api/mails/${mail1}/labels/${spamLabelId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    const isBlacklisted = await isUrlBlacklistedViaSpamMails(url);
    assert(!isBlacklisted, 'URL should still be blacklisted because it is still in another spam mail');
});

test('URL is removed from blacklist when no spam mails contain it anymore', async () => {
    const url = 'http://fullyremoved.com';
    // delete the URL from blacklist if it exists
    await api.delete(`/api/blacklist/${encodeURIComponent(url)}`)
        .set('Authorization', 'bearer ' + token)

    const res1 = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Spam1', body: `link: ${url}` })
        .expect(201);
    const mail1 = res1.body.id;

    await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Spam2', body: `check this out: ${url}` })
        .expect(201);

    await api.post(`/api/mails/${mail1}/labels`)
        .set('Authorization', 'bearer ' + token)
        .send({ labelId: spamLabelId })
        .expect(200);

    await api.delete(`/api/mails/${mail1}/labels/${spamLabelId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    const isStillBlacklisted = await isUrlBlacklistedViaSpamMails(url);
    assert(!isStillBlacklisted, 'URL should be removed from blacklist after all spam mails with it were unmarked');

    const res3 = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser@bmail.com'], title: 'Fresh Mail', body: `Here is the link again: ${url}` })
        .expect(201);
    const freshMailId = res3.body.id;

    const spamMails = await api.get('/api/mails/byLabel/spam')
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    assert(
        !spamMails.body.some(mail => mail.id === freshMailId),
        'Mail with removed URL should not be auto-marked as spam'
    );
});

after(async () => {
  await mongoose.connection.close();
});
