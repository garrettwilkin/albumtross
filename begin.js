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

function runInSafeUid(callback) {
    var state = 'success';
    try {
        var server = http.createServer(handleWebRequest);
        server.listen(standardHttpPort);
        process.setuid(nonRootUser);
        var uid = process.getuid();
        console.log('Running as user: ' + nonRootUser + ' UID: ' + uid + ' on port ' + standardHttpPort);
    }
    catch (err) {
        state = 'error';
    };
    callback(state);
};

function launch(state) {
    if (state == 'success') {
        console.log('successful launch');
    } else {
        console.log('Initialization Error');
        process.exit(1);
    }
};

function contactLastFM(response) {
    console.log('Contacting Last.fm ... Soon!');
};

function handleWebRequest(request, response) {
  /*
   * Ye Olde Code
  var responseHeaders  = {
    'Content-Type': 'text/html'
  };
  response.writeHead(200, responseHeaders);
  var path = url.parse(request.url).pathname;
  
  if (path == '/') {
    contactLastFM(response);
    
  } else {
    response.write('Welcome to Albumtross');
  }
   */
  request.addListener('end', function() {
    fileServer.serve(request, response);
    console.log('proudly serving static files since 2011');
  });
};
runInSafeUid(launch);
