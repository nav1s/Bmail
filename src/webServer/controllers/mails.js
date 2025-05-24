const { buildMail, filterMailForOutput } = require('../models/mailSchema');
const { badRequest, created, unauthorized } = require('../utils/httpResponses');
const { mails } = require('../data/memory');
const { getUserIdFromToken } = require('../models/tokens');

/**
 * POST /api/mails
 * Creates a new mail and stores it in memory.
 * Requires user to be logged in (loginToken).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function createMail(req, res) {
  // Build mail with sender injected as 'from' -> add this in later assignment where we have a header
  const input = {
    ...req.body
  };

  // Creating new mail
  const id = mails.length + 1;
    const newMail = buildMail(input, id);

  if (!newMail.success) {
    return badRequest(res, newMail.error);
  }

  // Store the mail and return public-facing response
  mails.push(newMail.mail);
  return created(res, filterMailForOutput(newMail.mail));
}

/**
 * GET /api/mails
 * Returns the last 50 mails sent to the logged-in user.
 * Requires login.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function listInbox(req, res) {
    // Filter mails where userId is a recipient
  //const userId = getUserIdFromToken(req.loginToken); -> later will be added when we filter mails by user
  const relevant = mails
    //.filter(mail => Array.isArray(mail.to) && mail.to.includes(userId)) -> later will be added when we filter mails by user
    .slice(-50)
    .map(filterMailForOutput);

  res.json(relevant);
}

module.exports = {
  createMail,
  listInbox
};
