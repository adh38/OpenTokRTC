
var room = require('./room');
var baseURL = 'http://localhost/OpenTokRTC';

/*
 * GET users listing.
 */

exports.list = function( req, res ){
  console.log('navigated to ' + req.url);
  // make sure that we are always in https
  if(req.header('x-forwarded-proto')!="https" == "production" ){
    res.redirect( baseURL + req.url );
    return;
  }

  // find request format, json or html?
  var path = req.params.userName.split(".json");
  var userName = path[0];
  var ref = room.getUserRef.push({name: userName, room: 0});
  var uid = ref.name();

  room.getWaitingRef.push(uid);
  res.render('waiting', {uname: userName, uid: uid});

};