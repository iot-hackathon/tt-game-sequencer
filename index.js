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
var express = require('express');                     // Express Middleware
var cfenv = require('cfenv');                         // Cloud Foundry Environment
var bodyParser = require('body-parser');              // Body Parser to get that POST data from requests
var hitQueue = require('./controllers/hitQueue.js');  // Hit Queue

// Create Express application
var app = express();

// Parser for JSON input
var jsonParser = bodyParser.json();
app.use(jsonParser);

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
  res.send('<h1>Kizomba Gang rules!</h1>');
});


// *************
// POST   /hit
// *************
app.post("/hit", jsonParser, function(req, res) {
    console.log("DEBUG: Post /hit called");
    if(!req.body) {
        console.log("DEBUG: Did not find any body in request.");
        res.status(409).send("Request did not contain necessary data");
    }

    if(!req.is('json')) {
        console.log("DEBUG: Request does not contain json data");
        res.status(409).send("Request does not contain json data");
    }

    console.log("DEBUG: Incoming request at Post /hit called with request: " + JSON.stringify(req.body));



    // Check whether the incoming JSON conforms to the required format
    if(req.body.hitTime && req.body.seqCount >= 0 && req.body.sourceSensor) {

        // Minimal data is available for now, start building the JSON object
        console.log("DEBUG: Received event with hitTime, seqCount, sourceSensor\n");

        var ttHit = {
            "hitTime" : req.body.hitTime,
            "seqCount" : req.body.seqCount,
            "sourceSensor" : req.body.sourceSensor,
            hitSource : "unknown",
            leftOrRight : "unknown",
            tableField : "unknown"
        };

        // Check for optional properties
        if(req.body.hitSource) {
            console.log("DEBUG: Event " + req.body.seqCount + " also includes the optional parameter 'hitSource'\n");
            ttHit.hitSource = req.body.hitSource;
        }
        if(req.body.leftOrRight) {
            console.log("DEBUG: Event " + req.body.leftOrRight + " also includes the optional parameter 'leftOrRight'\n");
            ttHit.leftOrRight = req.body.leftOrRight;
        }
        if(req.body.tableField) {
            console.log("DEBUG: Event " + req.body.tableField + " also includes the optional parameter 'tableField'\n");
            ttHit.tableField = req.body.tableField;
        }


        // Asynchronously call the "insert into queue" function to store the event
        hitQueue.newHit(ttHit);

        // Save event to queue

        // Analyze the Queue and Decide what happened

        // Inconclusive -> wait for other events

        // Conclusive -> Send conclusion and delete the queue

        console.log("DEBUG: Returning with 200");
        res.status(200).send();
        return;

    } else {
        // Input is not correct, deliver an error
        console.log("DEBUG: Invalid JSON or no JSON supplied");
        res.status(400).send("The supplied JSON does not conform to the expected object for declaring a 'hit'\n");
        return;
    }

    // TODO decide what to do in the very end
    res.status(400).send("Reached final branch, probably an error\n");
});


// *************
// POST   /servicePrepare
// *************
app.post("/servicePrepare", jsonParser, function(req, res) {
    console.log("DEBUG: Post /servicePrepare called");

    if(!req.body) {
        console.log("DEBUG: Did not find any body in request.");
        res.status(409).send("Request did not contain necessary data");
    }

    if(!req.is('json')) {
        console.log("DEBUG: Request does not contain json data");
        res.status(409).send("Request does not contain json data");
    }

    console.log("DEBUG: Incoming request at Post /servicePrepare called with request: " + JSON.stringify(req.body));



    // Check whether the incoming JSON conforms to the required format
    if(req.body.tableLeftRightPlayer) {
        // Minimal data is available for now, start building the JSON object
        var ttServicePrepare = {
            "playerToServer": req.body.tableLeftRightPlayer,
            "timeTrigger": req.body.timeTrigger
        }

        console.log("DEBUG: Received event with tableLeftRightPlayer: " + ttServicePrepare.playerToServe + "\n"  );

        // Check for optional properties
        if(req.body.timeTrigger) {
            console.log("DEBUG: Event " + ttServicePrepare.triggerTime + " also includes the optional parameter 'timeTrigger'\n");
        }
        // empty queue
        hitQueue.resetQueue();
        console.log("DEBUG: Returning with 200");
        res.status(200).send();
        return;

    } else {
        // Input is not correct, deliver an error
        console.log("DEBUG: Invalid JSON or no JSON supplied");
        res.status(400).send("The supplied JSON does not conform to the expected object for declaring a 'hit'\n");
        return;
    }

    // TODO decide what to do in the very end
    res.status(400).send("Reached final branch, probably an error\n");
    // res.status(200).send();
    return;
});

// ==================================
//          Express Routes
// ==================================



// serve the files out of ./public as our main files // TODO discuss, whether to use this
//app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(serverPort, '0.0.0.0', function() {
    // print a message when the server starts listening
    console.log("Server starting on " + appEnv.url);
});
