const fse = require('fs-extra');
const argv = require('../lib/yargs')
const devMode = argv.dev;

exports.modifyPackageJson = function(packageJsonPath) {
  const packageJson = require(packageJsonPath);
  const originalPackageJson = JSON.parse(JSON.stringify(packageJson))
  Object.assign(packageJson.scripts, {
    "test": "jest",
    "test:watch": "jest --watch",
    "prepare": "npx husky install"
  });

  // if devMode set up script to restore original packageJson
  if(devMode) {
    Object.assign(packageJson.scripts, {
      "postinstall": `echo '${JSON.stringify(originalPackageJson, null, 2)}' > 'package.json'`,
      "prepare": ""
    });
  }
  
  Object.assign(packageJson, {
    "devDependencies": {},
    "jest": {
      "testEnvironment": "node",
      "coveragePathIgnorePatterns": [
        "/node_modules/"
      ],
      "verbose": true
    },
    "eslintConfig": {
      "env": {
        "es6": true,
        "node": true
      },
      "extends": "airbnb-base",
      "parserOptions": {
        "ecmaVersion": 6
      },
      "rules": {
        "no-console": "off",
        "eol-last": "off",
        "prefer-template": "off"
      }
    },
    "eslintIgnore": [
      "__tests__/*.js",
      "jest.config.js"
    ],
    "lint-staged": {
      "*.js": [
        "npx eslint --cache"
      ]
    }
  });
  
  Object.assign(packageJson.devDependencies, {
    "eslint": "^7.32.0",
    "eslint-config-airbnb-base": "^14.2.1",
    "eslint-plugin-import": "^2.24.1",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-promise": "^5.1.0",
    "husky": "^7.0.1",
    "jest": "^26.6.3",
    "lint-staged": "^11.1.2",
    "rewire": "^5.0.0"
  });
  
  fse.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}