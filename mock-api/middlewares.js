const clientSessions = require('client-sessions');
const { getEnvVariables } = require('./env');
const { dbTools } = require('./dbTools');
// const csurf = require('csurf');

const env = getEnvVariables();

exports.authMiddleware = (req, res, next) => {
  const session = req[env.sessionName];
  const sessionPresent = session && session.user;

  if (!sessionPresent) {
    return res.status(401).json({
      message: 'Not authenticated'
    });
  }

  // Check DB that user exists
  const db = dbTools.getDb();
  const existingUser = db.users.find((u) => u.sub === session.user.sub);

  if (!existingUser) {
    session.reset();

    return res.status(401).json({
      message: 'Session user not found!'
    });
  }

  next();
};

const ONE_HOUR = 3600000;
exports.sessionMiddleware = clientSessions({
  cookieName: env.sessionName,
  secret: env.sessionSecret,
  duration: ONE_HOUR,
  cookie: {
    maxAge: ONE_HOUR,
    httpOnly: true,
    sameSite: 'strict'
  }
});

exports.loggerMiddleware = (db) => (req, res, next) => {
  console.log('LOGGER: Request', req.method, req.url);
  console.log('LOGGER: db', db);
  console.log('LOGGER: session', req[env.sessionName]);

  next();
};

// exports.corsMiddleware = (req, res, next) => {
//   res
//     .header('Access-Control-Allow-Origin', env.corsDomain)
//     .header('Access-Control-Allow-Credentials', 'true')
//     .header(
//       'Access-Control-Allow-Headers',
//       `Origin, X-Requested-With, Content-Type, Accept, ${env.csrfCookieName}`
//     );

//   next();
// };

// exports.csrfErrorHandler = (err, req, res, next) => {
//   if (err.code !== 'EBADCSRFTOKEN') {
//     return next(err);
//   }

//   res.status(403).json({
//     message: 'Invalid CSRF Token. Form has been tampered with.'
//   });
// };

// exports.csrfMiddleware = csurf({
//   cookie: true,
//   value: (req) => req.cookies[env.csrfCookieName]
// });
