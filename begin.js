/*
 * A interface between last.fm and iTunes APIs.
 * Created as a way to unit test the iTunes api @
 *   git@github.com:garrettwilkin/iTunes.git
 */

var nonRootUser = 'garrett';
var standardHttpPort = 80;

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

var http = require('http');
var url = require('url');

var lastPath = '';

function contactLastFM(response) {
    response.write('<p>Contacting Last.fm ... Soon!</p>');
};


function handleWebRequest(request, response) {
  var responseHeaders  = {
    'Content-Type': 'text/html'
  };
  response.writeHead(200, responseHeaders);
  var path = url.parse(request.url).pathname;
  
  setTimeout(function() {

    if (path == '/') {
      response.write('<p>iTunes API test site for @garrettwilkin.</p>');
      response.write('<p>');
      response.write('<ul>');
      response.write('<li>Establish form for entry of LastFM username</li>');
      response.write('<li>Use entered username to contact last to retrieve the user\'s loved tracks.</li>');
      response.write('<li>For each loved track, look up the corresponding iTunes album.</li>');
      response.write('<li>Add storage of loved tracks and iTunes album information.</li>');
      response.write('</ul>');
      response.write('</p>');
      response.write('<p>Let the testing begin...</p>');
      response.write('<p></p>');

      response.write('');

      contactLastFM(response);
      
      response.write('');
      response.write('');
    } else {
      response.write('Welcome to Albumtross');
    }

    response.end();

    //Commenting out response.end() allows the album art to 
    //pop into the page when the callbacks complete!
    //response.end();

    if (path != '/favicon.ico') {
      lastPath = path;
    }
  }, 5000);
};
runInSafeUid(launch);
