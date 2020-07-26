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
        message: 'Org not found!'
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
        message: 'Org not found!'
      });
    } else {
      const { projectName, projectKey } = req.body;

      const existingProject = org.projects.find((p) => p.name === projectName);

      if (existingProject) {
        console.log('existingProject', existingProject);
        return res.status(400).json({
          message: 'A project with that name already exists'
        });
      }

      const { sub, email, firstName, lastName } = user;

      const newProject = {
        id: uniqId(),
        name: projectName,
        key: projectKey,
        lead: { sub, email, firstName, lastName },
        orgId: org.id,
        orgName: org.name,
        dateCreated: new Date().toUTCString(),
        columns: [
          { id: uniqId(), name: 'TODO', tasks: [], taskLimit: null },
          { id: uniqId(), name: 'IN PROGRESS', tasks: [], taskLimit: null },
          { id: uniqId(), name: 'DONE', tasks: [], taskLimit: null }
        ],
        uiSequence: ['TODO', 'IN PROGRESS', 'DONE'],
        type: 'Next-gen software'
      };

      console.log(newProject);

      org.projects.push(newProject);

      dbTools.replaceDb(db);

      res.json({ project: newProject });
    }
  })
  .get('/api/orgs/:orgId/validateProjectName', createProjectValidator('name'))
  .get('/api/orgs/:orgId/validateProjectKey', createProjectValidator('key'))

  .get('/api/orgs/:orgName/projects/:projectKey', (req, res) => {
    // Find associated user
    const { user } = req[env.sessionName];
    const db = dbTools.getDb();
    const existingUser = db.users.find((u) => u.sub === user.sub);

    // Find associated org
    const { orgName, projectKey } = req.params;
    const org = existingUser.orgs.find((o) => o.name === orgName);

    if (!org) {
      return res.status(404).json({
        message: 'Org not found!'
      });
    }

    // Find associated project
    const project = org.projects.find((p) => p.key === projectKey);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found!'
      });
    }

    res.json({ project });
  })
  .get('/api/orgs/:orgName/projects/:projectKey', (req, res) => {
    // Find associated user
    const { user } = req[env.sessionName];
    const db = dbTools.getDb();
    const existingUser = db.users.find((u) => u.sub === user.sub);

    // Find associated org
    const { orgName, projectKey } = req.params;
    const org = existingUser.orgs.find((o) => o.name === orgName);

    if (!org) {
      return res.status(404).json({
        message: 'Org not found!'
      });
    }

    // Find associated project
    const project = org.projects.find((p) => p.key === projectKey);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found!'
      });
    }

    res.json({ project });
  })

  .post('/api/orgs/:orgName/projects/:projectKey/columns', (req, res) => {
    // Find associated user
    const { user } = req[env.sessionName];
    const db = dbTools.getDb();
    const existingUser = db.users.find((u) => u.sub === user.sub);

    // Find associated org
    const { orgName } = req.params;
    const org = existingUser.orgs.find((o) => o.name === orgName);

    if (!org) {
      res.status(404).json({
        message: 'Org not found!'
      });
    } else {
      const { projectKey } = req.params;

      // Find associated project
      const project = org.projects.find((p) => p.key === projectKey);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found!'
        });
      }

      const { name } = req.body;

      const existingColumn = project.columns.find((c) => c.name === name);

      if (existingColumn) {
        console.log('existingColumn', existingColumn);
        return res.status(400).json({
          message: 'A column with that name already exists in the project'
        });
      }

      const newColumn = {
        id: uniqId(),
        name: name,
        tasks: [],
        taskLimit: null
      };

      project.columns.push(newColumn);

      dbTools.replaceDb(db);

      res.json({ columns: project.columns });
    }
  })

  .put(
    '/api/orgs/:orgName/projects/:projectKey/columns/:columnId',
    (req, res) => {
      // Find associated user
      const { user } = req[env.sessionName];
      const db = dbTools.getDb();
      const existingUser = db.users.find((u) => u.sub === user.sub);

      // Find associated org
      const { orgName, projectKey } = req.params;
      const org = existingUser.orgs.find((o) => o.name === orgName);

      if (!org) {
        return res.status(404).json({
          message: 'Org not found!'
        });
      }

      // Find associated project
      const project = org.projects.find((p) => p.key === projectKey);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found!'
        });
      }

      const { columnId } = req.params;

      const column = project.columns.find((c) => c.id === columnId);

      if (!column) {
        return res.status(404).json({
          message: 'Not found!'
        });
      }
      const { newValue } = req.body;

      if (column.name === newValue) {
        return res
          .status(400)
          .json({ message: "This is already the column's name" });
      }

      const nameTaken = project.columns.some((c) => c.name === newValue);

      if (nameTaken) {
        return res.status(400).json({
          message: 'Name already taken'
        });
      }

      column.name = newValue;
      dbTools.replaceDb(db);

      res.json({ columns: project.columns });
    }
  )
  .delete(
    '/api/orgs/:orgName/projects/:projectKey/columns/:columnId',
    (req, res) => {
      // Find associated user
      const { user } = req[env.sessionName];
      const db = dbTools.getDb();
      const existingUser = db.users.find((u) => u.sub === user.sub);

      // Find associated org
      const { orgName, projectKey } = req.params;
      const org = existingUser.orgs.find((o) => o.name === orgName);

      if (!org) {
        return res.status(404).json({
          message: 'Org not found!'
        });
      }

      // Find associated project
      const project = org.projects.find((p) => p.key === projectKey);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found!'
        });
      }

      const { columnId } = req.params;

      const column = project.columns.find((c) => c.id === columnId);

      if (!column) {
        return res.status(404).json({
          message: 'Not found!'
        });
      }

      if (project.columns.length === 1) {
        return res.status(400).json({
          message: 'Cannot delete the last column!'
        });
      }

      project.columns = project.columns.filter((c) => c.id !== columnId);
      dbTools.replaceDb(db);

      res.json({ columns: project.columns });
    }
  )

  .post(
    '/api/orgs/:orgName/projects/:projectKey/columns/:columnId/tasks',
    (req, res) => {
      // Find associated user
      const { user } = req[env.sessionName];
      const db = dbTools.getDb();
      const existingUser = db.users.find((u) => u.sub === user.sub);

      // Find associated org
      const { orgName, projectKey, columnId } = req.params;
      const org = existingUser.orgs.find((o) => o.name === orgName);

      if (!org) {
        return res.status(404).json({
          message: 'Org not found!'
        });
      }

      // Find associated project
      const project = org.projects.find((p) => p.key === projectKey);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found!'
        });
      }

      const column = project.columns.find((c) => c.id === columnId);

      if (!column) {
        return res.status(404).json({
          message: 'Not found!'
        });
      }

      const { name, reporterId } = req.body;

      // Create task
      const newTask = {
        id: uniqId(),

        // From request
        name,
        reporterId,
        orgName,
        columnId,

        projectId: project.id,
        assigneeId: null,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        description: '',

        // TODO: How will uiSequence be implemented?
        uiSequence: Infinity
      };

      column.tasks.push(newTask);

      dbTools.replaceDb(db);

      res.json({ columns: project.columns });
    }
  )

  .put(
    '/api/orgs/:orgName/projects/:projectKey/columns/:columnId/tasks/:taskId/rename',
    (req, res) => {
      // Find associated user
      const { user } = req[env.sessionName];
      const db = dbTools.getDb();
      const existingUser = db.users.find((u) => u.sub === user.sub);

      // Find associated org
      const { orgName, projectKey, columnId, taskId } = req.params;
      const { newTaskName } = req.body;
      const org = existingUser.orgs.find((o) => o.name === orgName);

      if (!org) {
        return res.status(404).json({
          message: 'Org not found!'
        });
      }

      // Find associated project
      const project = org.projects.find((p) => p.key === projectKey);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found!'
        });
      }

      const column = project.columns.find((c) => c.id === columnId);

      if (!column) {
        return res.status(404).json({
          message: 'Not found!'
        });
      }

      column.tasks = column.tasks.map((t) =>
        t.id !== taskId ? t : { ...t, name: newTaskName }
      );

      dbTools.replaceDb(db);

      res.json({ columns: project.columns });
    }
  )

  .delete(
    '/api/orgs/:orgName/projects/:projectKey/columns/:columnId/tasks/:taskId',
    (req, res) => {
      // Find associated user
      const { user } = req[env.sessionName];
      const db = dbTools.getDb();
      const existingUser = db.users.find((u) => u.sub === user.sub);

      // Find associated org
      const { orgName, projectKey, columnId, taskId } = req.params;
      const org = existingUser.orgs.find((o) => o.name === orgName);

      if (!org) {
        return res.status(404).json({
          message: 'Org not found!'
        });
      }

      // Find associated project
      const project = org.projects.find((p) => p.key === projectKey);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found!'
        });
      }

      const column = project.columns.find((c) => c.id === columnId);

      if (!column) {
        return res.status(404).json({
          message: 'Not found!'
        });
      }

      column.tasks = column.tasks.filter((t) => t.id !== taskId);

      dbTools.replaceDb(db);

      res.json({ columns: project.columns });
    }
  )

  .put(
    '/api/orgs/:orgName/projects/:projectKey/columns/:columnId/setColumnLimit',
    (req, res) => {
      // Find associated user
      const { user } = req[env.sessionName];
      const db = dbTools.getDb();
      const existingUser = db.users.find((u) => u.sub === user.sub);

      // Find associated org
      const { orgName, projectKey } = req.params;
      const org = existingUser.orgs.find((o) => o.name === orgName);

      if (!org) {
        return res.status(404).json({
          message: 'Org not found!'
        });
      }

      // Find associated project
      const project = org.projects.find((p) => p.key === projectKey);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found!'
        });
      }

      const { columnId } = req.params;

      const column = project.columns.find((c) => c.id === columnId);

      if (!column) {
        return res.status(404).json({
          message: 'Not found!'
        });
      }

      const { limit } = req.body;

      column.taskLimit = limit;
      dbTools.replaceDb(db);

      res.json({ columns: project.columns });
    }
  )

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

/**
 *
 * @param {'name' | 'key'} prop
 */
function createProjectValidator(prop) {
  return (req, res) => {
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
          message: 'Org not found!'
        });
      }

      const valueToCompare = req.query[prop];
      const existingProject = org.projects.find(
        (p) => p[prop].toLowerCase() === valueToCompare.toLowerCase()
      );

      if (existingProject) {
        return res.json({
          available: false,
          message:
            prop === 'name'
              ? 'That name is taken'
              : `Project ${existingProject.name} uses this project key`
        });
      }

      return res.json({
        available: true
      });
    }, 800);
  };
}

// Allow tests to import Express app
exports.app = app;
