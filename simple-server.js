const express = require('express');
const path = require('path');
const app = express();
const port = 9000;

app.use(express.static('out'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});