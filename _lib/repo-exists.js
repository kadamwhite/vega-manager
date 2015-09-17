const bluebird = require( 'bluebird' );

const fs = bluebird.promisifyAll( require( 'fs' ) );
const Promise = bluebird.Promise;

var dir = require( './dir' );

function repoExists( repo ) {
  return fs.statAsync( dir( repo ) ).then(function( repoStats ) {
    if ( ! repoStats.isDirectory() ) {
      return Promise.reject( 'Not a directory' );
    }
  });
}

module.exports = repoExists;
