// This function will test localstorage to see if its actually available and
// working.
var _getLocalStorage = function() {

  // Set storage to localStorage - if test fails storage is set to null
  var storage = window.localStorage;

  // We initialize the fail flag defaulting to true
  var fail = true;

  // In the test we test the localstorage api setItem/getItem/removeItem this
  // uid will hopefully prevent any overwriting of existing data
  var uid = Random.id();

  try {
    // Use the setItem api
    storage.setItem(uid, uid);
    // Test the getItem api and check if the value could be set and retrieved
    fail = (storage.getItem(uid) !== uid);
    // Test removeItem and clean up the test data
    storage.removeItem(uid);

    // If the test failed then set the storage to null
    if (fail) storage = null;

  } catch(e) {
    // Noop, cant do much about it
  }

  // Return the tested localstorage
  return storage;
};

// Get storage if available
var _storage = _getLocalStorage();


// Check to see if we got any localstorage to add
if (_storage) {
  
  // Create a namespace to track storage name spacing
  var _localStorageNS = {};

  // Create a noop function
  var noop = function() {};

  // Prefix convention
  var _prefix = function(name) {
    return '_storage.' + name;
  };

  // Prefix database
  var _prefixDatabase = function(name) {
    return _prefix(name) + '.db.';
  };

  // Prefix database record
  var _prefixDatabaseRecord = function(name) {
    return _prefix(name) + '.record';
  };

  // Helper getting and updating the table record
  var _setTableRecord = function(SAInstance, migrationCallback) {

    // Database record name in localstorage
    var recordName = _prefixDatabaseRecord(SAInstance.name);

    // Get the database record
    var oldRecordString = _storage.getItem(recordName);

    // Set the default empty record object
    var record = {};
    
    try {

      // Get old record object
      record = oldRecordString && EJSON.parse(oldRecordString) || {};

    } catch(err) {
      // Noop, cant do much about it, we assume that data is lost
    }

    // Set new version helper
    var newVersion = SAInstance.version;

    // Set old version helper
    var oldVersion = record.version || 1.0;

    // Update the record
    record.version = SAInstance.version;

    try {
      
      // Create new record as string
      var newRecordString = EJSON.stringify(record);

      // Store the new record
      _storage.setItem(recordName, newRecordString);

    } catch(err) {
      // Noop, cant do much here
    }

    migrationCallback.call(SAInstance, {
      version: oldVersion
    }, {
      version: newVersion
    });
  };

  // Yeah, got it - add the api to the Storage global
  Store.localStorage = function(options) {
    var self = this;

    if (!(self instanceof Store.localStorage))
      return new Store.localStorage(self.name);

    // Inheritance EventEmitter
    self.eventemitter = new EventEmitter();

    // Make sure options is at least an empty object
    options = options || {};

    // Set the name on the instance
    self.name = options.name;

    // Check to see if the storage is already defined
    if (_localStorageNS[self.name])
      throw new Error('Storage.localStorage "' + self.name + '" is already in use');

    // Make sure that the user dont use '.db.'
    if (/\.db\./.test(self.name))
      throw new Error('Storage.localStorage "' + self.name + '" contains ".db." this is not allowed');

    // Set the size of db 0 === disable quota
    // TODO: Implement
    self.size = options.size || 0;

    // Set version - if this is bumped then the data is cleared pr. default
    // migration
    self.version = options.version || 1.0;

    // Set migration function
    var migrationFunction = options.migration || function(oldRecord, newRecord) {
      
      // Check storage versions
      if (oldRecord.version !== newRecord.version) {
        // We allow the user to customize a migration algoritme but here we just
        // clear the storage if versions mismatch
        self.clear(noop);
      }
    };

    // Store the instance
    _localStorageNS[self.name] = self;


    // Set the table record, at the moment this is only handling the version
    _setTableRecord(self, migrationFunction);

  };

  // Simple helper to return the storage type name
  Store.localStorage.prototype.typeName = function() {
    return 'localStorage';
  };

  Store.localStorage.prototype.prefix = function() {
    var self = this;
    return _prefixDatabase(self.name);
  };

  Store.localStorage.prototype.getPrefixedId = function(name) {
    var self = this;
    return self.prefix() + name;
  };

  //////////////////////////////////////////////////////////////////////////////
  // WRAP LOCALSTORAGE API
  //////////////////////////////////////////////////////////////////////////////

  Store.localStorage.prototype.getItem = function(name, callback) {
    var self = this;

    // Check if callback is function
    if (typeof callback !== 'function')
      throw new Error('Storage.localStorage.getItem require a callback function');

    try {
      
      // Get the string value
      var jsonObj = _storage.getItem(self.getPrefixedId(name));
      
      // Try to return the object of the parsed string
      callback(null, jsonObj && EJSON.parse(jsonObj) || jsonObj);

    } catch(err) {
      // Callback with error
      callback(err);

    }
    
  };

  Store.localStorage.prototype.setItem = function(name, obj, callback) {
    var self = this;

    // Check if callback is function
    if (typeof callback !== 'function')
      throw new Error('Storage.localStorage.setItem require a callback function');

    try {

      // Stringify the object
      var jsonObj = EJSON.stringify(obj);

      // Try to set the stringified object
      callback(null, _storage.setItem(self.getPrefixedId(name), jsonObj));

    } catch(err) {

      // Callback with error
      callback(err);

    }
  };

  Store.localStorage.prototype.removeItem = function(name, callback) {
    var self = this;

    // Check if callback is function
    if (typeof callback !== 'function')
      throw new Error('Storage.localStorage.removeItem require a callback function');

    try {

      // Try to remove the item
      callback(null, _storage.removeItem(self.getPrefixedId(name)));
      
    } catch(err) {

      // callback with error
      callback(err);

    }
  };

  Store.localStorage.prototype.clear = function(callback) {
    var self = this;

    // Check if callback is function
    if (typeof callback !== 'function')
      throw new Error('Storage.localStorage.clear require a callback function');

    try {

      // Find all relevant keys for this storage
      self.keys(function(err, keys) {
        if (err) {

          // On error we just callback
          callback(err);

        } else {

          // Iterate over keys and removing them one by one
          for (var i=0; i < keys.length; i++)
            self.removeItem(keys[i], noop);

          // Callback
          callback(null, keys.length);
        } 
      });
      
    } catch(err) {

      // callback with error
      callback(err);

    }
  };

  Store.localStorage.prototype.keys = function(callback) {
    var self = this;

    // Check if callback is function
    if (typeof callback !== 'function')
      throw new Error('Storage.localStorage.keys require a callback function');

    // Result to return
    var result = [];

    try {

      // Create the prefix test
      var regex = new RegExp('^' + self.prefix());

      for (var i = 0; i < _storage.length; i++) {

        // Test if the key is relevant to this store
        if (regex.test(_storage.key(i)))
          // Add the name
          result.push(_storage.key(i).replace(regex, ''));
      }

      // Return the result
      callback(null, result);
      
    } catch(err) {

      // callback with error
      callback(err);

    }
  };

  Store.localStorage.prototype.length = function(callback) {
    var self = this;

    // Check if callback is function
    if (typeof callback !== 'function')
      throw new Error('Storage.localStorage.length require a callback function');

    try {

      // Get the keys
      self.keys(function(error, keys) {
        
        // Return the length
        callback(error, keys && keys.length || null);

      });
      
    } catch(err) {

      // callback with error
      callback(err);

    }
  };

  Store.localStorage.prototype.toObject = function(callback) {
    var self = this;

    // Check if callback is function
    if (typeof callback !== 'function')
      throw new Error('Storage.localStorage.toObject require a callback function');

    // Result to return
    var result = {};

    try {

      // Create the prefix test
      var regex = new RegExp('^' + self.prefix());

      for (var i = 0; i < _storage.length; i++) {
        // Helper
        var key = _storage.key(i);

        // Test if the key is relevant to this store
        if (regex.test(key)) {
          try {
            
            // Get the string value
            var jsonObj = _storage.getItem(key);
            
            // Try to return the object of the parsed string
            result[key.replace(regex, '')] = jsonObj && EJSON.parse(jsonObj) || jsonObj;

          } catch(err) {
            // NOOP
          }          
        }
          
      }

      // Return the result
      callback(null, result);
      
    } catch(err) {

      // callback with error
      callback(err);

    }
  };

  //////////////////////////////////////////////////////////////////////////////
  // WRAP EVENTEMITTER API
  //////////////////////////////////////////////////////////////////////////////

  // Wrap the Event Emitter Api "on"
  Store.localStorage.prototype.on = function(/* arguments */) {
    this.eventemitter.on.apply(this.eventemitter, _.toArray(arguments));
  }; 

  // Wrap the Event Emitter Api "once"
  Store.localStorage.prototype.once = function(/* arguments */) {
    this.eventemitter.once.apply(this.eventemitter, _.toArray(arguments));
  }; 

  // Wrap the Event Emitter Api "off"
  Store.localStorage.prototype.off = function(/* arguments */) {
    this.eventemitter.off.apply(this.eventemitter, _.toArray(arguments));
  }; 

  // Wrap the Event Emitter Api "emit"
  Store.localStorage.prototype.emit = function(/* arguments */) {
    this.eventemitter.emit.apply(this.eventemitter, _.toArray(arguments));
  }; 


  // Add api helpers
  Store.localStorage.prototype.addListener = Store.localStorage.prototype.on;
  Store.localStorage.prototype.removeListener = Store.localStorage.prototype.off;
  Store.localStorage.prototype.removeAllListeners = Store.localStorage.prototype.off;

  // Add jquery like helpers
  Store.localStorage.prototype.one = Store.localStorage.prototype.once;
  Store.localStorage.prototype.trigger = Store.localStorage.prototype.emit;



  //////////////////////////////////////////////////////////////////////////////
  // WRAP LOCALSTORAGE EVENTHANDLER
  //////////////////////////////////////////////////////////////////////////////

  // This will be a quick test to see if we have any relations to the data
  var _prefixedByUs = new RegExp('^' + _prefix(''));

  // Add event handlers
  if (typeof window.addEventListener !== 'undefined') {
      // Add support for multiple tabs
      window.addEventListener('storage', function(e) {
      // Data changed in another tab, it would have updated localstorage, I'm
      // outdated so reload the tab and localstorage - but we test the prefix on the
      // key - since we actually make writes in the localstorage feature test

      // First of lets make sure that it was actually prefixed by us
      if (e.key && _prefixedByUs.test(e.key)) {

        // Okay, this looks familiar, now we try to lookup the storage instance
        // to emit an event on...

        // Remove the prefix
        var noPrefix = e.key.replace(_prefixedByUs, '');

        // So we know that the name dont contain suffix ".db."
        var elements = noPrefix.split('.db.');

        var storageName = elements.shift();

        // Get the remaining key
        var key = elements.join('.db.');

        // Get the affected storage
        var storageAdapter = _localStorageNS[storageName];

        if (storageAdapter) {

          // Emit the event on the storage
          storageAdapter.emit('storage', {
            key: key,
            newValue: e.newValue && EJSON.parse(e.newValue) || e.newValue,
            oldValue: e.oldValue && EJSON.parse(e.oldValue) || e.oldValue,
            originalKey: e.key,
            updatedAt: new Date(e.timeStamp),
            url: e.url,
            storage: storageAdapter
          });
        }

      }

    }, false);
}

}
