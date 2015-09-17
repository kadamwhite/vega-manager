const path = require( 'path' );
const rootDir = path.join( __dirname, '../' );

module.exports = function dir( repo ) {
  return path.join( rootDir, repo );
}
