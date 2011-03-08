/*
 * A interface between last.fm and iTunes APIs.
 * Created as a way to unit test the iTunes api @
 *   git@github.com:garrettwilkin/iTunes.git
 */

var http = require('http');
var url = require('url');
var iTunes = require('itunes').iTunes;

/*
 * Celebratory log message.
 */

var Divider = require('divider').Divider;
var inform = new Divider('iFM');
inform.print('A new web project to demonstrate the iTunes API.');
inform.print('.');

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
    }

    //Commenting out response.end() allows the album art to 
    //pop into the page when the callbacks complete!
    //response.end();

    if (path != '/favicon.ico') {
      lastPath = path;
    }
  }, 5000);
};

var server = http.createServer(handleWebRequest);

server.listen(8005);

