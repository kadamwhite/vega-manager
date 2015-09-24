const bluebird = require( 'bluebird' );

var repoCommands = require( './_lib/repo-commands' );

// A subset of the vega repos that serve as dependencies
var dependencyReposToLink = [
  'datalib',
  'vega-lite',
  'vega-lite-ui'
];
var reposThatUseThoseDeps = [
  'polestar',
  'voyager'
];


repoCommands.bower.isInstalled()
.then(function() {
  var linkDependencies = dependencyReposToLink.map(function( repo ) {
    console.log( 'Running "bower link" for ' + repo + '...' );
    return repoCommands.bower.link( repo );
  });
  return bluebird.all( linkDependencies ).then(function() {
    console.log( 'All packages linked' );
  });
})
.then(function() {
  var linkReposToDependencies = reposThatUseThoseDeps.map(function( repo ) {
    console.log( 'Linking all dependencies for ' + repo + '...' );
    var linkPromises = dependencyReposToLink.map(function( dep ) {
      console.log( '  linking ' + dep + ' to ' + repo );
      return repoCommands.bower.link( repo, dep );
    });
    return bluebird.all( linkPromises ).then(function() {
      console.log( 'All dependencies for ' + repo + ' have been linked' );
    });
  });
  return bluebird.all( linkReposToDependencies );
})
.then(function() {
  console.log( 'Bower is configured for local development' );
});
