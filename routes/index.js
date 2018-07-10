const express = require('express');
const fs = require('fs');
const router = express.Router();
const fileHandler = require("./../utils/fileUtil");
const fileListPath = __dirname + '/../monitorList.json';
let connections = {};

router.get('/', function (req, res, next) {
    /*
    Home page, Hit it and enjoy the logs
     */

    // Note: Fos simplicity epoch is used as token to support multiple tabs or simultaneous tail operations.
    // This doesn't handle collision of tokens.
    let fileList = JSON.parse(fs.readFileSync(fileListPath).toString());
    res.render('index', {
        fileName: fileList[0],
        fileList: fileList,
        token: (new Date()).getTime()
    });
});

router.get('/livetail/', function (req, res, next) {

    let token = req.query.token;
    if (!(token && req.query.fileName)) {
        return res.send("Error: Missing required params.")
    }
    let connection = connections[token];
    if (!connection) {
        //Setup event stream
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write(`event:log\ndata: ${JSON.stringify({logs: ''})} \n\n`);
        connections[token] = res;

        let handler = fileHandler(token, req.query.fileName);
        function handleChange(log) {
            if (log) {
                res.write(`event:log\ndata: ${JSON.stringify({logs: log})} \n\n`)
            }
        }

        handler.addEvent('change'+token, handleChange);

        res.socket.on('close', function () {
            console.log("Closing connection!");
            handler.removeEvent('change'+token, handleChange);
            handler.closeWatch(token);
            res.end();
            connections[token] = null;
        });

    } else {
        res.send(`event:log\ndata: ${JSON.stringify({logs: ''})} \n\n`);
    }

});

module.exports = router;
