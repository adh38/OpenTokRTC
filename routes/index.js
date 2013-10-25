
/*
 * GET home page.
 */

exports.index = function( req, res ){
  console.log('navigated to root');
  // make sure that we are always in https
  if(req.header('x-forwarded-proto')!="https" && process.env.NODE_ENV == "production" ){
    res.redirect( baseURL );
  }else{
    res.render( 'index' );
  }
};