/* Main application file for the Table Tennis Game Sequencer (ttgs)
 * 
 * The ttgs receives events from the game and evaluates what happened. It will send this data to the Table Tennis Judge for evaluation
 *
 * © 2016 IBM Corp.
 * @author: Sebastian Wegmann
 */

'use strict';

/* ==================
 * IMPORTS
 * ==================
 */
var express = require('express'); // Express Middleware
var cfenv = require('cfenv');     // Cloud Foundry Environment

//var http = require('http');

// Create Express application
var app = express();

// Set the port of the application. Default to 8080 if it cannot be retrieved from cfenv.
var appEnv = cfenv.getAppEnv();

if(!appEnv) {
  console.log("DEBUG: appEnv not set, seems we are not running on Bluemix right now");
}
var serverPort = appEnv.port || 8080;
console.log("DEBUG: Server Port is " + serverPort);

// ==================================
//          Express Routes
// ==================================

// *************
// GET    / 
// *************
app.get('/', function(req, res) {
  console.log("DEBUG: Main page called (get on /)");
  res.send('<h1>hello world</h1>');
});


// *************
// POST   /hit
// *************
app.post("/hit", function(req, res) {
    console.log("DEBUG: Incoming request at Post /hit called with request: " + JSON.stringify(req.body));
    console.log("DEBUG: Post /hit called with payload: " + req.body);
    res.end();
});

// serve the files out of ./public as our main files // TODO discuss, whether to use this
//app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(serverPort, '0.0.0.0', function() {
    // print a message when the server starts listening
    console.log("Server starting on " + appEnv.url);
});


