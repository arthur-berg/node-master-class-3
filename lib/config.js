const environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsASecret',
  stripeKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
  mailgunKey: 'fff984b79c500a9da665c00b7cd19626-c1fe131e-467b7324',
  templateGlobals: {
    appName: 'Pizza delivery',
    companyName: 'NotARealCompany, Inc.',
    yearCreated: '2018',
    baseUrl: 'http://localhost:3000/'
  }
};

// Production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsAlsoASecret',
  stripeKey: 'stripeSuperSecret',
  mailgunKey: 'fff984b79c500a9da665c00b7cd19626-c1fe131e-467b7324',
  templateGlobals: {
    appName: 'Pizza delivery',
    companyName: 'NotARealCompany, Inc.',
    yearCreated: '2018',
    baseUrl: 'http://localhost:3000/'
  }
};

// Determine which environment was passed as a command-line argument
const currentEnvironment =
  typeof process.env.NODE_ENV == 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';

// Check that the current environment is one of the environments above, if not default to staging
const environmentToExport =
  typeof environments[currentEnvironment] == 'object'
    ? environments[currentEnvironment]
    : environments.staging;

// Export the module
module.exports = environmentToExport;
