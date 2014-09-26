Package.describe({
  name: "ground:localstorage",
  version: "0.0.1",
  summary: "Adds localstorage adapter on client",
  git: "https://github.com/GroundMeteor/localstorage.git"
});

Package.on_use(function (api) {

  if (api.versionsFrom) {

    api.versionsFrom('METEOR@0.9.1');

    api.imply('ground:store@0.0.0');
    
    api.use([
      'random',
      'underscore',
      'ground:store@0.0.0',
      'raix:eventemitter@0.0.2'
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


  api.add_files('client.js', 'client');
  // api.add_files('server.js', 'server');
});

Package.on_test(function (api) {
  if (api.versionsFrom) {
    api.use('ground:localstorage', ['client', 'server']);
  } else {
    api.use('ground-localstorage', ['client', 'server']);
  }
  api.use('test-helpers', 'client');
  api.use(['tinytest', 'underscore', 'ejson']);

  api.add_files('client.tests.js', 'client');
  //api.add_files('server.tests.js', 'server');

});
