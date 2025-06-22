const { test } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

let nonAttachableLabels;
let spamLabelId;

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
        .send({ to: ['testUser'], title: 'Hello', body: 'world' })
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
        .expect(204);

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
        .expect(204);

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

// 7. Marking mail as spam adds its URLs to the blacklist
test('Marking mail as spam adds its URLs to the blacklist', async () => {
    let url = 'http://badlink.com';
    // remove the url from the blacklist if it exists
    await api.delete(`/api/blacklist/${encodeURIComponent(url)}`)
        .set('Authorization', 'bearer ' + token)
        .expect(204);

    const mailBody = `Suspicious link: ${url}`;

    res = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser'], title: 'Spam Link', body: mailBody })
        .expect(201);
    const newMailId = res.body.id;

    await api.post(`/api/mails/${newMailId}/labels`)
        .set('Authorization', 'bearer ' + token)
        .send({ labelId: spamLabelId })
        .expect(204);
});

// 8. Removing spam label removes URLs from the blacklist
test('Removing spam label removes URLs from the blacklist', async () => {
    const mailBody = 'Another spammy link: http://removeme.com';

    const res = await api.post('/api/mails')
        .set('Authorization', 'bearer ' + token)
        .send({ to: ['testUser'], title: 'Spam Removal', body: mailBody })
        .expect(201);
    const mailToUnspam = res.body.id;

    // Add spam label
    await api.post(`/api/mails/${mailToUnspam}/labels`)
        .set('Authorization', 'bearer ' + token)
        .send({ labelId: spamLabelId })
        .expect(204);

    // Remove spam label
    await api.delete(`/api/mails/${mailToUnspam}/labels/${spamLabelId}`)
        .set('Authorization', 'bearer ' + token)
        .expect(204);

    // Check blacklist
    const blacklistRes = await api.get('/api/blacklist')
        .set('Authorization', 'bearer ' + token)
        .expect(200);

    console.log('Blacklist after removal:', blacklistRes.body);
    assert(!blacklistRes.body.includes('http://removeme.com'), 'Link should be removed from blacklist');
});

// 9. Mail with blacklisted URL is automatically marked as spam
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
        .send({ to: ['testUser'], title: 'Auto Spam', body: `Hey check this: ${blacklistedUrl}` })
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
