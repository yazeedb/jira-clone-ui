const uniqId = require('uniqid');
const express = require('express');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const { getEnvVariables } = require('./env');
const { authMiddleware, sessionMiddleware } = require('./middlewares');
const { dbTools } = require('./dbTools');

const app = express();
const port = 8000;
const env = getEnvVariables();

app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())

  .use(cookieParser())
  .use(sessionMiddleware)

  .post('/login', (req, res) => {
    const client = new OAuth2Client(env.googleClientId);
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        message: 'No Google ID Token found!'
      });

      return;
    }

    client
      // Verify Google user
      .verifyIdToken({
        idToken,
        audience: env.googleClientId
      })
      .then((loginTicket) => loginTicket.getPayload())
      .then(({ sub, email }) => {
        const db = dbTools.getDb();
        const existingUser = db.users.find((u) => u.sub === sub);

        if (!existingUser) {
          const newUser = { sub, email, orgs: [] };

          db.users.push(newUser);
          req[env.sessionName] = { user: newUser };
          dbTools.replaceDb(db);
        } else {
          req[env.sessionName] = { user: existingUser };
        }

        res.status(204).send();
      })
      .catch((error) => {
        res.status(401).json({
          message: error.message
        });
      });
  })

  // Start protecting routes
  .use('/api/*', authMiddleware)

  .get('/api/user', (req, res) => {
    res.json(req[env.sessionName]);
  })

  .post('/api/completeSignup', (req, res) => {
    const { user } = req[env.sessionName];
    const signupFormData = req.body;

    if (user.sub !== signupFormData.sub) {
      res.status(400).json({
        message: "Session and form Google IDs don't match!"
      });

      return;
    }

    const db = dbTools.getDb();

    const existingUser = db.users.find(
      (u) => u.googleClientId === user.googleClientId
    );

    if (!existingUser) {
      res.status(404).json({
        message: 'User not found!'
      });
    } else {
      for (const key in signupFormData) {
        // ensure email is never overwritten
        if (key !== 'email') {
          existingUser[key] = signupFormData[key];
        }
      }

      dbTools.replaceDb(db);

      req[env.sessionName] = { user: existingUser };

      res.status(204).send();
    }
  })

  .get('/api/orgs', (req, res) => {
    const { user } = req[env.sessionName];
    const db = dbTools.getDb();
    const existingUser = db.users.find((u) => u.sub === user.sub);

    if (!existingUser) {
      res.status(400).json({
        message: 'User not found!'
      });
    } else {
      res.json({
        orgs: existingUser.orgs
      });
    }
  })

  .post('/api/orgs', (req, res) => {
    const { org } = req.body;
    const { user } = req[env.sessionName];

    const db = dbTools.getDb();
    const existingUser = db.users.find((u) => u.sub === user.sub);

    if (!existingUser) {
      res.status(400).json({
        message: 'User not found!'
      });
    } else {
      const orgId = uniqId();

      existingUser.orgs = [
        {
          id: orgId,
          ownerId: existingUser.sub,
          name: org,
          dateCreated: new Date(),
          projects: []
        }
      ];

      dbTools.replaceDb(db);

      res.json({
        message: 'Org created!',
        orgId
      });
    }
  })

  .get('/api/orgs/:orgId/projects', (req, res) => {
    // Find associated user
    const { user } = req[env.sessionName];
    const db = dbTools.getDb();
    const existingUser = db.users.find((u) => u.sub === user.sub);

    // Find associated org
    const { orgId } = req.params;
    const org = existingUser.orgs.find((o) => o.id === orgId);

    if (!org) {
      res.status(404).json({
        message: 'No projects found!'
      });
    } else {
      res.json({
        projects: org.projects
      });
    }
  })
  .post('/api/orgs/:orgId/projects', (req, res) => {
    // Find associated user
    const { user } = req[env.sessionName];
    const db = dbTools.getDb();
    const existingUser = db.users.find((u) => u.sub === user.sub);

    // Find associated org
    const { orgId } = req.params;
    const org = existingUser.orgs.find((o) => o.id === orgId);

    if (!org) {
      res.status(404).json({
        message: 'Org not found'
      });
    } else {
      const { projectName, key } = req.body;

      const existingProject = org.projects.find((p) => p.name === projectName);

      if (existingProject) {
        console.log('existingProject', existingProject);
        return res.status(400).json({
          message: 'A project with that name already exists'
        });
      }

      const newProject = {
        id: uniqId(),
        name: projectName,
        key,
        uiSequence: ['TO DO', 'IN PROGRESS', 'DONE'],
        columns: [
          { name: 'TO DO', tasks: [], taskLimit: null },
          { name: 'IN PROGRESS', tasks: [], taskLimit: null },
          { name: 'DONE', tasks: [], taskLimit: null }
        ]
      };

      console.log(newProject);

      org.projects.push(newProject);

      dbTools.replaceDb(db);

      res.json({ project: newProject });
    }
  })
  .get('/api/orgs/:orgId/validateProjectName', (req, res) => {
    setTimeout(() => {
      // Find associated user
      const { user } = req[env.sessionName];
      const db = dbTools.getDb();
      const existingUser = db.users.find((u) => u.sub === user.sub);

      // Find associated org
      const { orgId } = req.params;
      const org = existingUser.orgs.find((o) => o.id === orgId);

      if (!org) {
        return res.status(404).json({
          message: 'Org not found'
        });
      }

      const { projectName } = req.query;
      const existingProject = org.projects.find((p) => p.name === projectName);

      return res.json({
        available: !!existingProject === false
      });
    }, 800);
  })

  .all('*', (req, res, next) => {
    // res.cookie(env.csrfCookieName, req.csrfToken());

    next();
  })

  .use((req, res) => {
    res.status(404).json({
      message: 'Endpoint not found.'
    });
  });

// Don't go live during tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log('Listening on port', port);
  });
}

// Allow tests to import Express app
exports.app = app;
