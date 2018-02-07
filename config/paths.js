const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

/**
 * Relative paths to be used in webpack config files
 */
module.exports = {
  appPath: resolveApp('.'),
  appDist: resolveApp('umd'),
  appSrc: resolveApp('lib'),
  appConfig: resolveApp('config'),
  appIndexJs: resolveApp('lib/index.js'),
  appPackageJson: resolveApp('package.json'),
};
