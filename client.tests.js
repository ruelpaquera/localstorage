function equals(a, b) {
  return Boolean(JSON.stringify(a) === JSON.stringify(b));
}

Tinytest.addAsync('GroundDB - localstorage - test', function(test, complete) {
  var foo = Store.create({
    name: 'teststring',
    version: 1.0
  });

  test.isTrue(typeof foo.addListener === 'function', 'Got no event emitter?');

  foo.addListener('storage', function(e) {
    console.log('Storage event', e);
  });

  test.isTrue(foo.typeName() === 'localStorage', 'Store not found?');

  test.isTrue(foo instanceof Store.localStorage, 'Storage not an instance of localStorage?');

  foo.setItem('bar', 'test', function(err) {
    if (err) {
      test.fail('Could not setItem');
    } else {

      foo.getItem('bar', function(err, bar) {
        if (err) {
          test.fail('Could not getItem');
        } else {
          test.equal(bar, 'test', 'Storage is corrupt');

          foo.removeItem('bar', function() {
            foo.getItem('bar', function(err, bar) {
              if (err) {
                test.fail('Could not getItem');
              } else {
                test.isTrue(!bar, 'Storage is corrupt');
                complete();
              }

            });
          });
        }

      });

    }
  });


});

Tinytest.addAsync('GroundDB - localstorage - test object', function(test, complete) {
  var foo = Store.create({
    name: 'testobject',
    version: 1.0
  });

  foo.setItem('bar', { bar: 'test' }, function(err) {
    if (err) {
      test.fail('Could not setItem');
    } else {

      foo.getItem('bar', function(err, bar) {
        if (err) {
          test.fail('Could not getItem');
        } else {
          test.equal(bar.bar, 'test', 'Storage is corrupt');

          foo.removeItem('bar', function() {
            foo.getItem('bar', function(err, bar) {
              if (err) {
                test.fail('Could not getItem');
              } else {
                test.isTrue(!bar, 'Storage is corrupt');
                complete();
              }

            });
          });
        }

      });

    }
  });

});

Tinytest.addAsync('GroundDB - localstorage - test namespace / keys / clear', function(test, complete) {
  var foo = Store.create({
    name: 'foo',
    version: 1.0
  });

  var bar = Store.create({
    name: 'bar',
    version: 1.0
  });

  var noop = function() {};

  var fooKeys = [];
  var barKeys = [];

  // Fill the storage with some data - we know this is sync so we cheat a bit
  for (var i = 0; i < 10; i++) {
    fooKeys.push('foo'+i);
    foo.setItem('foo'+i, 'foo'+i, noop);
  }

  for (var i = 0; i < 10; i++) { // jshint ignore: line
    barKeys.push('bar'+i);
    bar.setItem('bar'+i, 'bar'+i, noop);
  }

  foo.keys(function(err, keys) {
    test.equal(keys.length, 10, 'Foo keys length dont match');
    test.isTrue(equals(fooKeys, keys), 'Foo keys dont match');
  });

  bar.keys(function(err, keys) {
    test.equal(keys.length, 10, 'Bar keys length dont match');
    test.isTrue(equals(barKeys, keys), 'Bar keys dont match');
  });

  foo.clear(noop);

  foo.keys(function(err, keys) {
    test.equal(keys.length, 0, 'Foo keys length dont match');
  });

  bar.keys(function(err, keys) {
    test.equal(keys.length, 10, 'Bar keys length dont match');
    test.isTrue(equals(barKeys, keys), 'Bar keys dont match');
  });

  bar.clear(noop);

  bar.keys(function(err, keys) {
    test.equal(keys.length, 0, 'Bar keys length dont match');
  });

  complete();

});

//Test API:
//test.isFalse(v, msg)
//test.isTrue(v, msg)
//test.equalactual, expected, message, not
//test.length(obj, len)
//test.include(s, v)
//test.isNaN(v, msg)
//test.isUndefined(v, msg)
//test.isNotNull
//test.isNull
//test.throws(func)
//test.instanceOf(obj, klass)
//test.notEqual(actual, expected, message)
//test.runId()
//test.exception(exception)
//test.expect_fail()
//test.ok(doc)
//test.fail(doc)
//test.equal(a, b, msg)
