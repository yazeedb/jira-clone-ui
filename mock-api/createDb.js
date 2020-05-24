const fs = require('fs');
const { dbTools } = require('./dbTools');

const db = {
  users: []
};

fs.writeFileSync(dbTools.dbPath, JSON.stringify(db, null, 2));
