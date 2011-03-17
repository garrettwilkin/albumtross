/*
 * A interface between last.fm and iTunes APIs.
 * Created as a way to unit test the iTunes api @
 *   git@github.com:garrettwilkin/iTunes.git
 */

var static = require('node-static');
var fileServer = new static.Server();
var http = require('http');
var url = require('url');


var nonRootUser = 'garrett';
var standardHttpPort = 80;
var lastPath = '';
var everyone = ''; //will be returned by runInSafeUid

var winston = require('winston');
//filenaming scheme
var log = new Object();
log.path = 'logs/';
log.uniquer =  new Date().getTime();
log.moniker = 'Albumtross_';
log.extension = '.log'
log.filename =  log.path + log.moniker + log.uniquer + log.extension;
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({filename: log.filename}),
    new (winston.transports.Loggly)({'subdomain':'albumtross',
                                     'inputToken':'555b08e5-6a66-4698-9e87-2bfefa9001f4',
                                     'auth': {
                                       'username':'garrettwilkin',
                                       'password':'love2loggly'}
                                    }),
  ]
});

function runInSafeUid(callback) {
    var state = 'success';
    try {
        //Initialize http server
        var server = http.createServer(handleWebRequest);
        server.listen(standardHttpPort);
        //Initialize now package
        var everyone = require("now").initialize(server);
        everyone.now.msg = "Now, Hello World";
        //Change to non root user ID.
        process.setuid(nonRootUser);
        var uid = process.getuid();
        logger.info('Running as user: ' + nonRootUser + ' UID: ' + uid + ' on port ' + standardHttpPort);
    }
    catch (err) {
        state = 'error';
        console.log(err);
    };
    callback(state);
    return everyone;
};

function launch(state) {
    if (state == 'success') {
        logger.info('successful launch');
    } else {
        logger.info('Initialization Error');
        process.exit(1);
    }
};

function handleWebRequest(request, response) {

  request.addListener('end', function() {

    //Initialize static file serving.
    fileServer.serve(request, response);

    //Drop breadcrumbs in the log.
    logger.info('Serving a static file with pride');
    var mth =  request.method;
    var url = request.url;
    logger.info(mth + ' ' + url);

  });

};

var everyone = runInSafeUid(launch);

everyone.now.contactLastFM = function (username) {
    logger.info(username + ' would like to contact Last.fm, how lovely.');
};

everyone.connected(function(){
  logger.info('client connected');
});

everyone.disconnected(function(){
  logger.info('client disconnected');
});

logger.info('All JS code loaded');
