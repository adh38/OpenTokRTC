var OpenTokLibrary = require('opentok');
var Firebase = require('firebase');
var $ = require('jquery');

// ***
// *** OpenTok Constants for creating Session and Token values
// ***
var OTKEY = '44156752'; //process.env.TB_KEY;
var OTSECRET = '0a5d1911011764f7ce92322aadfb72d503880225'; //process.env.TB_SECRET;
var OpenTokObject = new OpenTokLibrary.OpenTokSDK(OTKEY, OTSECRET);
var presenceListener = {};

//clear any existing data - use a Promise to make sure this happens before data listeners are set
var rootRef = new Firebase("https://jamroulette.firebaseIO.com"), def = $.Deferred();
rootRef.remove(function(error) {
    if(error) console.log('error clearing database: ' + error);
    else def.resolve();
});
var promise = def.promise();

var userRef = new Firebase("https://jamroulette.firebaseIO.com/users");
exports.getUserRef = userRef;

//set up an auto-updating copy of Firebase's list of unpaired users
var waitingRef= new Firebase("https://jamroulette.firebaseIO.com/waiting");
exports.getWaitingRef = waitingRef;

var waitingList = [], roomUsers = [];

promise.done(function() {
    waitingRef.on('child_added', function(child) {
        var newUser = {id: child.name(), uid: child.val()}, pair = null;
        //waitingList.push(newUser);
        console.log('nexting user ' + newUser.uid);

        var partners = [], def = $.Deferred();
        console.log('past partners:');
        userRef.child(newUser.uid + "/partners").once('value', function(snapshot) {
            snapshot.forEach(function(child) {
                partners.push(child.val());
                console.log(child.val());
            });
            def.resolve(1);
        });
        def.promise().done(function(val) {
            //see if there is an unused partner in the waiting list
            //console.log('waiting:');
            //for(var i = 0; i < waitingList.length; i++) console.log(waitingList[i].uid);
            for(var i = 0; i < waitingList.length; i++)
                if(partners.indexOf(waitingList[i].uid) < 0) {
                    console.log('choosing partner ' + waitingList[i].uid);
                    pair = [newUser, waitingList[i]];
                    waitingList.splice(i, 1);
                    break;
                }else console.log('skipping ' + waitingList[i].uid + '; already partnered');
            if(pair == null) {
                waitingList.push(newUser);
                return;
            }
            //get an OpenTok session ID which will double as the room ID
            OpenTokObject.createSession(function(sessionId){
                console.log('creating room ' + sessionId + ' for users:');
                for(var i = 0; i < 2; i++) {
                    var user = pair[i];
                    console.log(user.uid);
                    //alert the user of their new room via Firebase, and take them off the waiting list
                    userRef.child(user.uid).update({room: sessionId});
                    waitingRef.child(user.id).remove();
                    //mark these two users as having been partners of each other so they won't get re-paired later
                    userRef.child(user.uid + "/partners").push(pair[(i+1)%2].uid);
                    console.log("added " + pair[(i+1)%2].uid + " as partner of " + user.uid);
                }
                var roomRef = new Firebase("https://jamroulette.firebaseIO.com/room/" + sessionId);
                // on incoming request, make sure we have presenceListener to remove the room if it is empty
                if( !presenceListener[sessionId] ){
                    presenceListener[sessionId] = true
                    var presenceRef = new Firebase("https://rtcdemo.firebaseIO.com/room/" + sessionId + "/users");
                    presenceRef.on('value', function(dataSnapshot){
                        //remove room if there is no one in the room
                        if(dataSnapshot.numChildren() == 0){
                            roomRef.remove();
                        }
                    });
                }
            });
        });
    });
    waitingRef.on('child_removed', function(child) {
        var ind = waitingList.indexOf(child.name());
        if(ind >= 0) waitingList.splice(ind, 1);
    });
    //and list of rooms
    var roomRef = new Firebase("https://jamroulette.firebaseIO.com/rooms");
    var roomList = [];
    roomRef.on("child_added", function(child) {
        roomList.push(child.name());
    });
    roomRef.on("child_removed", function(child) {
        var ind = roomList.indexOf(child.name());
        if(ind >= 0) roomList.splice(ind, 1);
    });
});

exports.room = function(req, res) {
    var path = req.params.rid.split(".json");
    var rid = path[0];
    returnRoomResponse(res, {rid: rid, sid: rid, uid: req.query.uid, uname: req.query.uname});
};

//process a request to move to the next partner
exports.next = function( req, res ){
    userRef.child(req.query.uid).update({room: 0});
    waitingRef.push(req.query.uid);
    res.render('waiting', {uid: req.query.uid, uname: req.query.uname});
};

function returnRoomResponse( res, data, json ){
    data.apiKey = OTKEY;
    data.token = OpenTokObject.generateToken( {session_id: data.sid, role:OpenTokLibrary.RoleConstants.MODERATOR} );
    if( json == "" ){
        res.json( data );
    }else{
        res.render( 'room', data );
    }
}