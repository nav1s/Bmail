const express = require('express');
var app = express();
app.use(express.json());

// Tag disable
app.disable('etag');

// Routes
const users = require('./routes/users');
app.use('/api/users', users);

const tokens = require('./routes/tokens');
app.use('/api/tokens', tokens);

const mails = require('./routes/mails');
app.use('/api/mails', mails);

const labels = require('./routes/labels');
app.use('/api/labels', labels);

const blacklist = require('./routes/blacklist');
app.use('/api/blacklist', blacklist);

const search = require('./routes/search');
app.use('/api/search', search);

// Error handling
app.use((err, req, res, next) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

app.listen(8080)
