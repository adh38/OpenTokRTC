// ***
// *** Required modules
// ***
var express = require('express');
var routes = require('./routes');
var rooms = require('./routes/room');
var user = require('./routes/user');

// ***
// *** Setup Express to handle static files in public folder
// *** Express is also great for handling url routing
// ***
var app = express();
app.use(express.static(__dirname + '/public'));
app.set( 'views', __dirname + "/views");
app.set( 'view engine', 'ejs' );


// ***
// *** When user goes to root directory, render index page
// ***
app.get("/", routes.index);

app.get('/room/:rid', rooms.room);

//process a request to move to the next partner
app.get("/next", rooms.next);

//initial login
app.get("/:userName", user.list);

// ***
// *** start server, listen to port (predefined or 9393)
// ***
var port = process.env.PORT || 5000;
console.log('listening on ' + port);
app.listen(port);
