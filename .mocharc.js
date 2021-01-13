'use strict';

// Here's a JavaScript-based config file.
// If you need conditional logic, you might want to use this type of config.
// Otherwise, JSON or YAML is recommended.
module.exports = {
    require: ["@babel/register", "dotenv/config"],
    timeout: 20000,
    recursive: true,
    reporter: "spec",
    'watch-files': ['src/api.pact.spec.js']
  };

// module.exports = {
//   diff: true,
//   extension: ['js'],
//   package: './package.json',
//   reporter: 'spec',
//   slow: 75,
//   timeout: 2000,
//   ui: 'bdd',
//   'watch-files': ['src/*spec.js'],
//   'watch-ignore': ['lib/vendor']
// };