const { defineConfig } = require("cypress");
const fs = require('fs')

const pactCypressPlugin = require('@pactflow/pact-cypress-adapter/dist/plugin');

const setupNodeEvents = (on, config) => {
  pactCypressPlugin(on, config, fs);
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
  });
};

module.exports = defineConfig({
  e2e: {
    setupNodeEvents,
  },
});
