const fs = require('fs');

const dbPath = __dirname + '/db.json';

const dbTools = {
  dbPath,
  getDb: () => JSON.parse(fs.readFileSync(dbPath)),
  replaceDb: (db) => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
};

exports.dbTools = dbTools;
