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
        console.log('Running as user: ' + nonRootUser + ' UID: ' + uid + ' on port ' + standardHttpPort);
    }
    catch (err) {
        state = 'error';
    };
    callback(state);
    return everyone;
};

function launch(state) {
    if (state == 'success') {
        console.log('successful launch');
    } else {
        console.log('Initialization Error');
        process.exit(1);
    }
};

function handleWebRequest(request, response) {

  //Initialize static file serving.
  request.addListener('end', function() {
    fileServer.serve(request, response);
    console.log('proudly serving static files since 2011');
  });

};

var everyone = runInSafeUid(launch);

everyone.now.contactLastFM = function (username) {
    console.log(username + ' would like ot contact Last.fm, how lovely.');
};

console.log('All JS code loaded');
