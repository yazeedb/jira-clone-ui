const fs = require('fs');
const { dbTools } = require('./dbTools');

const db = {
  users: []
};

if (!fs.existsSync(dbTools.dbPath)) {
  fs.writeFileSync(dbTools.dbPath, JSON.stringify(db, null, 2));
}
