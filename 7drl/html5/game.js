
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'assets', true, true);
Module['FS_createPath']('/assets', 'fonts', true, true);
Module['FS_createPath']('/assets', 'sprites', true, true);
Module['FS_createPath']('/assets', 'tiles', true, true);
Module['FS_createPath']('/', 'lib', true, true);
Module['FS_createPath']('/', 'scripts', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 212, "filename": "/conf.lua"}, {"audio": 0, "start": 212, "crunched": 0, "end": 8837, "filename": "/dungeon.lua"}, {"audio": 0, "start": 8837, "crunched": 0, "end": 13830, "filename": "/entity.lua"}, {"audio": 0, "start": 13830, "crunched": 0, "end": 16302, "filename": "/gameengine.lua"}, {"audio": 0, "start": 16302, "crunched": 0, "end": 18003, "filename": "/gamemode.lua"}, {"audio": 0, "start": 18003, "crunched": 0, "end": 20641, "filename": "/gamestate.lua"}, {"audio": 0, "start": 20641, "crunched": 0, "end": 21714, "filename": "/input.lua"}, {"audio": 0, "start": 21714, "crunched": 0, "end": 24980, "filename": "/main.lua"}, {"audio": 0, "start": 24980, "crunched": 0, "end": 33638, "filename": "/map.lua"}, {"audio": 0, "start": 33638, "crunched": 0, "end": 47073, "filename": "/playstate.lua"}, {"audio": 0, "start": 47073, "crunched": 0, "end": 60835, "filename": "/systems.lua"}, {"audio": 0, "start": 60835, "crunched": 0, "end": 63109, "filename": "/timer.lua"}, {"audio": 0, "start": 63109, "crunched": 0, "end": 64761, "filename": "/utils.lua"}, {"audio": 0, "start": 64761, "crunched": 0, "end": 72957, "filename": "/assets/.DS_Store"}, {"audio": 0, "start": 72957, "crunched": 0, "end": 191161, "filename": "/assets/fonts/PressStart2P-Regular.ttf"}, {"audio": 0, "start": 191161, "crunched": 0, "end": 191755, "filename": "/assets/sprites/cowboy.png"}, {"audio": 0, "start": 191755, "crunched": 0, "end": 191919, "filename": "/assets/sprites/snake.png"}, {"audio": 0, "start": 191919, "crunched": 0, "end": 198489, "filename": "/assets/sprites/sprites.png"}, {"audio": 0, "start": 198489, "crunched": 0, "end": 199307, "filename": "/assets/tiles/tiles.png"}, {"audio": 0, "start": 199307, "crunched": 0, "end": 207799, "filename": "/lib/anim8.lua"}, {"audio": 0, "start": 207799, "crunched": 0, "end": 209827, "filename": "/lib/bresenham.lua"}, {"audio": 0, "start": 209827, "crunched": 0, "end": 231148, "filename": "/lib/bump.lua"}, {"audio": 0, "start": 231148, "crunched": 0, "end": 235262, "filename": "/lib/debugGraph.lua"}, {"audio": 0, "start": 235262, "crunched": 0, "end": 248332, "filename": "/lib/delaunay.lua"}, {"audio": 0, "start": 248332, "crunched": 0, "end": 253477, "filename": "/lib/flux.lua"}, {"audio": 0, "start": 253477, "crunched": 0, "end": 289372, "filename": "/lib/gamecontrollerdb.txt"}, {"audio": 0, "start": 289372, "crunched": 0, "end": 295201, "filename": "/lib/gamera.lua"}, {"audio": 0, "start": 295201, "crunched": 0, "end": 312516, "filename": "/lib/json.lua"}, {"audio": 0, "start": 312516, "crunched": 0, "end": 327607, "filename": "/lib/lume.lua"}, {"audio": 0, "start": 327607, "crunched": 0, "end": 331257, "filename": "/lib/moon.lua"}, {"audio": 0, "start": 331257, "crunched": 0, "end": 337060, "filename": "/lib/rsfov.lua"}, {"audio": 0, "start": 337060, "crunched": 0, "end": 341331, "filename": "/lib/tactile.lua"}, {"audio": 0, "start": 341331, "crunched": 0, "end": 344210, "filename": "/lib/talkback.lua"}, {"audio": 0, "start": 344210, "crunched": 0, "end": 373573, "filename": "/lib/tiny.lua"}, {"audio": 0, "start": 373573, "crunched": 0, "end": 377133, "filename": "/lib/vector-light.lua"}, {"audio": 0, "start": 377133, "crunched": 0, "end": 378607, "filename": "/scripts/bullet.lua"}, {"audio": 0, "start": 378607, "crunched": 0, "end": 379785, "filename": "/scripts/mineentrance.lua"}, {"audio": 0, "start": 379785, "crunched": 0, "end": 380313, "filename": "/scripts/script.lua"}, {"audio": 0, "start": 380313, "crunched": 0, "end": 383286, "filename": "/scripts/snake.lua"}], "remote_package_size": 383286, "package_uuid": "cce1bdd4-8669-421d-aa1f-f72f67bd5a9e"});

})();
