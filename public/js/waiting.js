// Generated by CoffeeScript 1.6.1
(function() {
  var goToRoom, verticalCenter;
  
  var User = (function() {

    function User(uname, uid) {
      console.log('running User');
      var self,
        _this = this;
      this.uid = uid;
      this.uname = uname;
      this.uref = new Firebase("https://jamroulette.firebaseIO.com/users/" + this.uid);
	  this.uref.on('value', function(snapshot) {
	  	if(snapshot.val().room && snapshot.val().room != 0)
		  	window.location = "/room/" + snapshot.val().room + "?uid=" + _this.uid + "&uname=" + _this.uname;
	  });
	  $('#actionItem').html('Hello ' + uname + ' [' + uid + '], you are waiting for a room...');
    }
    
    return User;

  })();

  window.User = User;
  console.log('hello from waiting');
  
  verticalCenter = function() {
    var mtop;
    mtop = (window.innerHeight - $("#insideContainer").outerHeight()) / 2;
    return $("#insideContainer").css({
      "margin-top": "" + mtop + "px"
    });
  };

  window.onresize = verticalCenter;

  verticalCenter();

}).call(this);
