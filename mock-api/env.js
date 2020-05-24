const commonConfig = {
  sessionName: 'sessionId',
  googleClientId:
    '235318923218-s6tms65fam3o6d51shlhmci587s5mi22.apps.googleusercontent.com',
  csrfCookieName: 'X-XSRF-TOKEN'
};

const devConfig = {
  ...commonConfig,
  sessionSecret: 'dev-secret'
};

// TODO: Maybe this'll be different later?
const testConfig = devConfig;

exports.getEnvVariables = () => {
  switch (process.env.NODE_ENV) {
    case 'dev':
      return devConfig;

    case 'test':
      return testConfig;

    // case 'production':
    // return prodConfig

    default:
      console.warn('No API ENV found, falling back to dev');
      return devConfig;
  }
};
