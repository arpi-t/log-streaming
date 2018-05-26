const express = require('express');
const router = express.Router();
const fileHandler = require("./../utils/fileUtil");
const fileName = process.env['LOG_FILE']||'./../access.log';

router.get('/', function (req, res, next) {
    /*
    Home page, Hit it and enjoy the logs of file passed via `LOG_FILE` env var.
     */

    // Note: Fos simplicity epoch is used as token to support mulitple tabs or simultaneous tail operations.
    // This doesn't handle collision of tokens.
    res.render('index', {fileName: fileName, token:(new Date()).getTime()});
});

router.get('/tail/', function (req, res, next) {
    /*
    This API returns the changes in file. Poll this continuously to get the changed data.
    API supports long polling. Returns empty string if no logs else returns the newly added logs.
    API requires token which can be used for multiple use cases. For now send anything.
     */
    if (!req.query.token){
        return res.send("Error: Missing file token.")
    }

    return res.json({logs: fileHandler(req.query.token, fileName).getTailData(req.query.token)});
});

module.exports = router;
