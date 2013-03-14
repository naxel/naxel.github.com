/**
 * User: naxel
 * Date: 25.02.13 17:35
 */
/**
 * Module dependencies.
 */
var express = require('express')
    , sio = require('socket.io');

/**
 * App.
 */
var app = express.createServer();

var port = 3001;

/**
 * App routes.
 */
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/demos.html');
});

/**
 * Demos router
 */
app.get('/demos/*', function(req, res) {
    res.sendfile(__dirname + '/demos/' + req.params[0] + '.html');
});

app.get('/js/*', function(req, res) {
    res.sendfile(__dirname + '/js/' + req.params[0]);
});


/**
 * App listen.
 */
app.listen(port, function() {
    console.log('   app listening on http://localhost/:' + port);
});

/**
 * Socket.IO server (single process only)
 */
var io = sio.listen(app);

io.sockets.on('connection', function(socket) {

    socket.on('signals', function(data) {
        console.log('signals');
        console.log(data);
        socket.broadcast.emit('signals', data);
    });

});
