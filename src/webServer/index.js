const app = require('./app');
require('custom-env').env();

app.listen(8080, () => console.log('Server running on port 8080'));
