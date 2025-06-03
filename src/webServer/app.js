const express = require('express');
const users = require('./routes/users');
const tokens = require('./routes/tokens');
const mails = require('./routes/mails');
const labels = require('./routes/labels');
const blacklist = require('./routes/blacklist');
const { serverError, notFound } = require('./utils/httpResponses');

const app = express();
app.use(express.json());

// Tag disable
app.disable('etag');

// Routes
app.use('/api/users', users);
app.use('/api/tokens', tokens);
app.use('/api/mails', mails);
app.use('/api/labels', labels);
app.use('/api/blacklist', blacklist);

// Error for unmatched /api/* routes — return JSON
app.use('/api', (req, res) => {
  notFound(res, `Cannot ${req.method} ${req.originalUrl}`);
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  serverError(res, 'An unexpected error occurred');
});

module.exports = app;
