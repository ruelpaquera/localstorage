Package.describe({
  name: "ground:localstorage",
  version: "0.1.8",
  summary: "Adds localstorage adapter on client",
  git: "https://github.com/GroundMeteor/localstorage.git"
});

Package.onUse(function (api) {

  if (api.versionsFrom) {

    api.versionsFrom('1.0');

    api.imply('ground:store@0.1.1');

    api.use([
      'random',
      'underscore',
      'ejson',
      'ground:store@0.1.1',
      'raix:eventemitter@0.1.1'
    ], 'client');

  } else {

    api.imply('ground-store');
    api.use([
      'random',
      'underscore',
      'eventemitter',
      'ground-store'
    ], 'client');

  }


  api.addFiles('client.js', 'client');
  // api.addFiles('server.js', 'server');
});

Package.onTest(function (api) {
  if (api.versionsFrom) {
    api.use('ground:localstorage', ['client', 'server']);
  } else {
    api.use('ground-localstorage', ['client', 'server']);
  }
  api.use('test-helpers', 'client');
  api.use(['tinytest', 'underscore', 'ejson']);

  api.addFiles('client.tests.js', 'client');
  //api.addFiles('server.tests.js', 'server');

});
