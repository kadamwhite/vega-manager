const bluebird = require( 'bluebird' );

const cp = bluebird.promisifyAll( require( 'child_process' ) );
const fs = bluebird.promisifyAll( require( 'fs' ) );
const path = require( 'path' );
const chalk = require( 'chalk' );

const repos = require( './repo-list' );

const dir = require( './_lib/dir' );
const repoExists = require( './_lib/repo-exists' );

var repoCommands = require( './_lib/repo-commands' );

function isMaster( repo ) {
  return cp.execAsync( 'git rev-parse --abbrev-ref HEAD', {
    cwd: dir( repo )
  }).then(function( buffer ) {
    // Get the output of the git command, less the newline
    var currentBranch = buffer[ 0 ].replace( '\n', '' );
    return currentBranch === 'master';
  });
}

function isClean( repo, cwd ) {
  return cp.execAsync( 'git diff --shortstat', { cwd: cwd })
    .then(function( buffer ) {
      // Get the output of the git command, which will be '' if no unstaged changes
      var diffOutput = buffer[ 0 ];
      return diffOutput === '';
    });
}

function updateRepo( repo, cwd ) {
  return isMaster( repo, cwd )
    .then(function( isMaster ) {
      if ( ! isMaster ) {
        throw 'not on master';
      }
      return isClean( repo, cwd );
    })
    .then(function( isClean ) {
      if ( ! isClean ) {
        throw 'uncommitted changes';
      }
      return cp.execAsync( 'git fetch --all', { cwd: cwd })
        .then(function() {
          return cp.execAsync( 'git merge origin/master', { cwd: cwd });
        })
        .then(function() {
          console.log( repo + ' updated to latest. Installing...' );
          return repoCommands.npm.install( repo )
        })
        .then(function() {
          console.log( 'Installation complete. Building ' + repo + '...' );
          return repoCommands.npm.runBuild( repo );
        })
        .then(function() {
          console.log( repo + ' is ' + chalk.green( 'ready to go' ) );
        })
        .catch(function( err ) {
          console.error( chalk.red( 'Warning' ) +
            ': Something went wrong while updating ' + repo );
          console.error( err.stack ? err.stack : err );
          return bluebird.Promise.resolve();
        });
    })
    .catch(function( err ) {
      if ( typeof err === 'string' ) {
        console.error( chalk.green( 'skipping ' + repo ) + ': ' + err );
      } else {
        console.error( chalk.red( repo ) + ': something went wrong' );
        console.error( err );
      }
      // Errors in one command should not prohibit script from completing
      return bluebird.Promise.resolve();
    });
}

var repoUpdatePromises = repos.map(function( repo ) {
  return repoExists( repo ).then(function() {
    return updateRepo( repo, dir( repo ) );
  }, function( err ) {
    console.log( chalk.red( repo + ' is missing' ) + ': you may need to run `npm run init`' );
    console.log( '  skipping ' + repo + '...' );
  });
});

bluebird.all( repoUpdatePromises ).then(function() {
  console.log( '\nAll repositories are up to date!' );
}, function( err ) {
  console.error( 'Something went wrong:' );
  console.error( err.stack ? err.stack : err );
  process.exit( 0 );
})
.then(function() {
  console.log( 'Updating bower linkages...' );
  require( './bower-link' );
});
