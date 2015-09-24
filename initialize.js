const bluebird = require( 'bluebird' );
const cp = bluebird.promisifyAll( require( 'child_process' ) );
const chalk = require( 'chalk' )

const repos = require( './repo-list' );
const repoExists = require( './_lib/repo-exists' );

console.log( 'Cloning repositories...\n' );

var repoClonePromises = repos.map(function( repo ) {
  return repoExists( repo ).then(function success() {
    console.log( chalk.green( 'skipping ' + repo ) + ': already available' );
  }, function failure( err ) {
    // Catching an error here means repo does not exist
    var cloneCommand = 'git clone git@github.com:vega/' + repo + '.git';
    return cp.execAsync( cloneCommand ).then(function() {
      console.log( repo + ' cloned' );
    });
  });
});

bluebird.all( repoClonePromises ).then(function() {
  console.log( '\nAll repositories cloned successfully' );
}, function( err ) {
  console.error( chalk.red( 'Something went wrong:' ) );
  console.error( err );
});
