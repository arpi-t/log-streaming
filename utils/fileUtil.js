const fs = require("fs");
const EventEmitter = require('events');

//Notes:
// - Token can be decoupled from here to keep module more generic.
function FileHandler(fileName, token) {
    /*
    This class takes care file tail operation. It returns an object on which call to _streamFile() function starts the
    watch on the file.
     */

    let watcher = null;
    let fileStream = null;
    const emitter = new EventEmitter();
    let watchHandler = null;

    return {

        addEvent: function (evt, handler) {
            emitter.on(evt, handler);
        },

        removeEvent: function (evt, handler) {
            emitter.removeListener(evt, handler);
        },

        _streamFile: function () {
            /*
            Start the watcher on file if not started already.
             */
            const that = this;
            if (!watcher) {
                console.log("Setting up watcher for file tail!");
                watchHandler = function (curr, prev) {
                    if (curr.size > prev.size) {
                        fileStream = fs.createReadStream(fileName, {
                            start: prev.size,
                            end: curr.size + 1
                        });

                        fileStream.on("end", () => {
                            fileStream.destroy();
                        });

                        fileStream.on("readable", () => emitter.emit('change' + token, that.getTailData()));

                    }
                };
                watcher = fs.watchFile(fileName, {interval: 1000}, watchHandler);
            }
            return fileStream
        },

        getTailData: function () {
            /*
            returns new additions to the file.
             */
            // fileStream can be null if no changes in file post initialization.
            return fileStream ? (fileStream.read() || "").toString() : "";
        },

        closeWatch: (token) => {
            fs.unwatchFile(fileName, watchHandler);
            watcher = null;
            fileStream = null;
            clearCacheWatcher(token);
        }
    }
}

// Cache for the FileHandler objects
_HANDLER_CACHE = {};

function cacheFileWatcher(token, watcher) {
    _HANDLER_CACHE[token] = watcher;
}

function clearCacheWatcher(token) {
    console.log("Cleaning watcher!");
    delete _HANDLER_CACHE[token];
}

FileHandler.clearWatch = clearCacheWatcher;

function getHandler(token, fileName) {
    /*
    Initializes the FileHandler class and returns its instance. (Internal caching is used for the same.)
     */
    let cachedHandler = _HANDLER_CACHE[token];
    if (!cachedHandler) {
        cachedHandler = new FileHandler(fileName, token);
        cachedHandler._streamFile();
        cacheFileWatcher(token, cachedHandler);
    }
    return cachedHandler;
}

module.exports = getHandler;
