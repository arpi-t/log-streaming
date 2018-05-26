const fs = require("fs");

//Notes:
// - Token can be decoupled from here to keep module more generic.
// - Constants can be made configurable within class via option param.
function FileHandler(fileName, token) {
    /*
    This class takes care file tail operation. It returns an object on which call to _streamFile() function starts the
    watch on the file.
    call getTailData on returned object to get any new additions in the file.
     */

    let watcher = null;
    let tailInterval = null;
    let lastAccess = null;
    let fileStream = null;

    return {

        CONSTANTS: {
            inactivityPeriod: 10 * 1000, //Check for client activity(In ms)
            checkPeriod: 10 * 1000 // How frequently to check for inactivity (In ms)
        },

        _streamFile: function () {
            /*
            Start the watcher on file if not started already.
             */
            if (!watcher) {
                console.log("Setting up watcher for file tail!");
                watcher = fs.watchFile(fileName, {interval: 1000}, function (curr, prev) {
                    if (curr.size > prev.size) {
                        fileStream = fs.createReadStream(fileName, {
                            start: prev.size,
                            end: curr.size
                        });

                        fileStream.on("end", () => {
                            fileStream.destroy();
                        });

                    }
                });
                tailInterval = setInterval(() => this._checkForActivity(), this.CONSTANTS.checkPeriod)
            }
            return fileStream
        },

        _checkForActivity: function () {
            //Check if client is active or not from last {CONSTANTS.inactivityPeriod} secs..
            if ((new Date() - lastAccess) > this.CONSTANTS.inactivityPeriod) {
                // Clear the tail file handler and process.
                console.log("Cleaning up watcher due to inactivity.");
                fs.unwatchFile(fileName);
                clearInterval(tailInterval);
                clearCacheWatcher(token);
                watcher = null;
            }
        },

        getTailData: function () {
            /*
            returns new additions to the file.
             */
            // Record last access time to keep track of client activity.
            lastAccess = new Date();

            // fileStream can be null if no changes in file post initialization.
            return fileStream ? (fileStream.read() || "").toString() : "";
        },
    }
}

// Cache for the FileHandler objects
_HANDLER_CACHE = {};

function cacheFileWatcher(token, watcher) {
    _HANDLER_CACHE[token] = watcher;
}

function clearCacheWatcher(token) {
    delete _HANDLER_CACHE[token];
}

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
