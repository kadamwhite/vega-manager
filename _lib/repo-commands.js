'use strict';

var bluebird = require( 'bluebird' );
var cp = bluebird.promisifyAll( require( 'child_process' ) );
var chalk = require( 'chalk' );

var dir = require( './dir' );
var isWin = /^win/.test( process.platform );

function npmInstall( repo ) {
  return function() {
    return cp.execAsync( 'npm install', {
      cwd: dir( repo )
    });
  };
  // .then(function( buffer ) {
  //   console.log( chalk.green( repo ) + ': installation complete' );
  // });
}

function npmRunBuild( repo ) {
  return cp.execAsync( 'npm run build', {
    cwd: dir( repo )
  });
}

function bowerIsInstalled() {
  return cp.execAsync( isWin ? 'where bower' : 'which bower' ).catch(function() {
    console.error( '\n' + chalk.red( 'Warning' ) + ': Bower is not installed!' +
      'Run "npm install -g bower".\n' );
    console.log( 'Exiting...' );
    process.exit( 0 );
  });
}

/**
 * Either link this module via bower, or link it to a previously-linked
 * module
 * @param  {String} repo     The name of the repo in /gh/ to link
 * @param  {String} [module] An optional module to link this repo to
 * @return {Promise}         A promise to the results of the exec'd command
 */
function bowerLink( repo, module ) {
  var linkCommand = module ? 'bower link ' + module : 'bower link';
  return cp.execAsync( linkCommand, {
    cwd: dir( repo )
  });
}

module.exports = {
  bower: {
    isInstalled: bowerIsInstalled,
    link: bowerLink
  },
  npm: {
    install: npmInstall,
    runBuild: npmRunBuild
  }
}
