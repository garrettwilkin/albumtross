/*
 * A interface between last.fm and iTunes APIs.
 * Created as a way to unit test the iTunes api @
 *   git@github.com:garrettwilkin/iTunes.git
 */
//require.paths.unshift(require('path').join(__dirname));
require.paths.unshift(require('path').join(__dirname));


//Configuration for albumtross
var config = require('config')('albumtross', {
  api_key : '123456',
  secret  : 'dontell',
  lg_user : 'balthazar'
});

//module created to facilitate configuration module.
function albumtross() {
};
exports.albumtross = albumtross;

//static file serving
var static = require('node-static');
var fileServer = new static.Server();

//standard modules
var http = require('http');
var url = require('url');

//LastFm module
var LastFmNode = require('lastfm').LastFmNode;
var lastfm = new LastFmNode({
  api_key: config.fm_key,
  secret: config.fm_secret
});

//iTunes module
var iTunes = require('itunes').iTunes;
var itunesClient = new iTunes();

var nonRootUser = 'garrett';
var standardHttpPort = 80;
var lastPath = '';
var everyone = ''; //will be returned by runInSafeUid

//logging with winston
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
    new (winston.transports.Loggly)({'subdomain':config.lg_subdomain,
                                     'inputToken':config.lg_key,
                                     'auth': {
                                       'username':config.lg_user,
                                       'password':config.lg_password}
                                    }),
  ]
});

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

function fmTrack(track) {
  this.name = track.name ;
  this.mbid = track.mbid; //musicbrainz.org unique ID.
  this.url = track.url;
  this.datetime = track.date; //array of two
  this.artist = track.artist; //datatype of its own
  this.image = track.image;   //array of 3-4
  this.streamable = track.streamable; //array of 2
};

function fmArtist(artist) {
  this.name = artist.name;
  this.mbid = artist.mbid;
  this.url = artist.url;
};

function iTrackHandler(error,itrack) {
  if (error) {
    console.log('iTrackHandler : Could not find track' );
  } else {
    console.log('iTrackHandler : success!!');
    console.log('iTrackHandler : itrack: ' + itrack.name + ' by artist ' + itrack.artistName);
  };

};

function lastFmHandler(type,data) {
  /* Maybe XML conversion isnt needed after all.
  var xml2 = require('util/node-xml2object/lib/xml2object');
  var parsed = xml2.parseString(data);
  logger.info('I\'ll make a JSON outta you! ' + JSON.stringify(parsed));
  */
  
  switch(type)
  {
    case 'lovedtracks':
      //logger.info('lastFmHandler: lovedtracks');
      var lovey = JSON.parse(data);
      var tracks = lovey.lovedtracks.track;
      for (i in tracks) 
      {
          var track = new fmTrack(tracks[i]);
          var artist = new fmArtist(track.artist);
          logger.info('Loved Track: ' + track.name + ' by ' + artist.name);
          itunesClient.lookupTrack({artist: artist.name, track: track.name},iTrackHandler);
      }
      break;
    default:
      logger.info('lastFmHandler: Unknown data Type');
  }

};


//Now.js code.  
//everyone must be created with the same server object created
//and used inside runInSafeUid. This was not elegant, but rather
//that refactor the code I just returned the everyone variable
//after the Now initialization.
var everyone = runInSafeUid(launch);

everyone.now.contactLastFM = function (username) {
    logger.info(username + ' would like to contact Last.fm, how lovely.');

    /* Removing to track bugs down.
    */
    
    var request = lastfm.read({method: 'user.getLovedTracks', user: username, limit: 5});
    request.on('success',function(data){
        logger.info('YAY! LastFm returns success for ' + username);
        logger.info('LastFm says : ' + data);
        lastFmHandler('lovedtracks',data);
    });
    request.on('error',function(data){
        logger.info('BOO! LastFm returns error for ' + username);
    });
};

everyone.connected(function(){
  logger.info('client connected');
});

everyone.disconnected(function(){
  logger.info('client disconnected');
});

logger.info('Configuration: '  + config.lg_user);

logger.info('All JS code loaded');
