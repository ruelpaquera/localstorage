Package.describe({
  name: "ground:localstorage",
  version: "0.1.9",
  summary: "Adds localstorage adapter on client",
  git: "https://github.com/GroundMeteor/localstorage.git"
});

Package.onUse(function (api) {

  api.versionsFrom('1.2');

  api.imply('ground:store@0.1.2');

  api.use([
    'random',
    'underscore',
    'ejson',
    'ground:store',
    'raix:eventemitter@0.1.3'
  ], 'client');

  api.addFiles('client.js', 'client');
  // api.addFiles('server.js', 'server');
});

Package.onTest(function (api) {
  api.use('ground:localstorage', ['client', 'server']);
  api.use('test-helpers', 'client');
  api.use(['tinytest', 'underscore', 'ejson']);

  api.addFiles('client.tests.js', 'client');
  //api.addFiles('server.tests.js', 'server');

});
