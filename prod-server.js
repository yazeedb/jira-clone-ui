const express = require('express');
const { join } = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname));
app.use(express.static(join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => console.log('Listening on port', PORT));
