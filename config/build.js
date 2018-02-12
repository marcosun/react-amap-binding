const execSync = require('child_process').execSync;

const exec = (command, extraEnv) => {
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv),
  });
};

console.log('Building CommonJS modules ...');

exec('babel lib -d . --ignore test.js', {
  BABEL_ENV: 'cjs',
  NODE_ENV: 'production',
});

console.log('\nBuilding ES modules ...');

exec('babel lib -d es --ignore test.js', {
  BABEL_ENV: 'es',
  NODE_ENV: 'production',
});

console.log('\nBuilding js-component-seed.js ...')

exec('webpack --config ./config/webpack.prod.js', {
  BABEL_ENV: 'umd',
  NODE_ENV: 'production',
});
