// index.js
const envName = process.env.NODE_ENV || 'prod';
require('custom-env').env(envName);

const expressApp = require('./app');
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log('[db] Mongo connected');

    const port = process.env.PORT || 8080;
    expressApp.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error('[db] connection error:', err);
    process.exit(1);
  }
})();
