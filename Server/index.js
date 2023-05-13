// App initialize
const express = require('express');
const app = express();

// Listening on port 3001
const port = 3001 || process.env.PORT;

app.listen(`${port}`, () => {
    console.log('Listening on port: ' + port);
})