'use strict';


/*==============================================================================
 * Variables and Imports
 *==============================================================================
 */

var queue = [];
var server = "unset";
var gameSequenceFinished = "false";
var http = require('http');
var request = require('request');
var wouldBeWinner = "not set";


/*==============================================================================
 * Exports
 *==============================================================================
 */
module.exports = {

    "newHit" : newHit,
    "resetQueue" : resetQueue
};


// *****
// resetQueue
// *****
function resetQueue(player) {
    
    // Logic to evaluate the open sequence
    if(gameSequenceFinished == false) {
        console.log("DEBUG: Previous game sequence did not come to a conclusion. Count a point for " + wouldBeWinner);
        // Post call to tt-judge
        request({
            url: 'http://ttj.mybluemix.net/point',
            method: 'POST', 
            json: {
                "player" : wouldBeWinner,
                "pointType" : "not sure"
            }
        }, function(error, response, body) {
            if(error) {
                console.log("Error: " + error);
            } else {
                console.log(response.statusCode, body);
            }
        });
    }    
    console.log("DEBUG: resetQueue and setting server to " + player);
    queue = [];
    server = player;
    console.log("GAME: Opening game sequence for next rally.");
    gameSequenceFinished = false;
    wouldBeWinner = "not set";
}

// *****
// Compare Function for hits (should allow sort an array of hits by sequence Count)
// *****
function hitComparator(hitA, hitB) {
    // console.log("DEBUG: hitComparator called with " +  JSON.stringify(hitA) + " and " + JSON.stringify(hitB));
    return parseInt(hitA.hitTime) - parseInt(hitB.hitTime);
}

/*==============================================================================
 * Functions
 *==============================================================================
 */

// *****
// Include a new hit in the queue and trigger follow-up events
// *****
function newHit(ttHit) {
    //console.log("DEBUG: Entering newHit");

    if(gameSequenceFinished) {
        console.log("~~ GAME ~~: Game sequence is already finished. Ignoring this hit event.");
        return;
    }

    //console.log("DEBUG: Pushing into queue. queue has " + queue.length + " elements.");
    queue.push(ttHit);

    //console.log("DEBUG: Sorting the queue. The queue has " + queue.length + " elements.");
    queue.sort(hitComparator);

    //console.log("DEBUG: Check if the queue is stable enough for evaluation.");
    evaluateQueueStability();
    //console.log("DEBUG: Leaving newHit");

}

// *****
// Evaluate whether there are gaps in the queue. If so, do nothing, otherwise tirgger an evaluation
// cycle (asynchronously) 
// *****
function evaluateQueueStability() {

    // Check whether the queue contains gaps
    // var initialCount = queue[0].seqCount;
    // console.log("DEBUG: Currently the queue starts at the offset of " + initialCount);

    // for(var i = 1; i<queue.length; i++) {
    //     var nextCount = initialCount + i;
    //     if(!(nextCount == queue[i].seqCount)) {
    //         console.log("DEBUG: Expected the element at position " + i + " to have the sequence count of " + nextCount + " but found " + queue[i].seqCount +  " instead.");
    //         return;
    //     } else {
    //         console.log("DEBUG: Sequence is ordered so far…");
    //     }
    // }

    // console.log("DEBUG: Sequence is completely ordered, calling the evaluator");
    //console.log("DEBUG: Removed sequence Counter, no evaluation done.");
    evaluator();
    //console.log("DEBUG: Test statement for async state of call. Should be called immediately");
}

// *****
// Check the queue whether it contains events which lead to a complete game sequence 
// *****
function evaluator() {
    // console.log("DEBUG: Entering evaluator");

    var state = 0;

    for(var i=0; i<queue.length; i++) {

        // State 0: Nothing has happened after initializing the game sequence
        if(state === 0) {
            if(queue[i].leftOrRight == "left" && server == "left") {
                state = 1;
                // go on
                wouldBeWinner = "right";
                console.log("~~ GAME ~~: Left player served and played to left side first. We continue. Would be winner is " + wouldBeWinner);
                
            } else if(queue[i].leftOrRight == "right" && server == "left") {
                // point for right. Exit
                console.log("~~ GAME ~~: Left player served and played directly to the right side. Point for player right.");
                // Post call to tt-judge
                request({
                    url: 'http://ttj.mybluemix.net/point',
                    method: 'POST', 
                    json: {
                        "player" : "right",
                        "pointType" : "not sure"
                    }
                }, function(error, response, body) {
                    if(error) {
                        console.log("Error: " + error);
                    } else {
                        //console.log(response.statusCode, body);
                    }
                });
                gameSequenceFinished = true;
                return;
            } else if(queue[i].leftOrRight == "left" && server == "right") {
                // point for left. Exit
                console.log("~~ GAME ~~: Right player served and played directly to the left side. Point for player left.");
                // Post call to tt-judge
                request({
                    url: 'http://ttj.mybluemix.net/point',
                    method: 'POST', 
                    json: {
                        "player" : "right",
                        "pointType" : "not sure"
                    }
                }, function(error, response, body) {
                    if(error) {
                        console.log("Error: " + error);
                    } else {
                        //console.log(response.statusCode, body);
                    }
                });
                gameSequenceFinished = true;
                return;
            } else if(queue[i].leftOrRight == "right" && server == "right") {
                state = 1;
                // go on
                wouldBeWinner = "left";
                console.log("~~ GAME ~~: Right player served and played to right side first. We continue. Would be winner is " + wouldBeWinner);
            }
        }
        // State 1: Player hit his side first
        else if (state === 1) {

            if(queue[i].leftOrRight == "left" && server == "left") {
                // point for right. Exit
                console.log("~~ GAME ~~: Left player hit his side twice. Point for player right.");
                // Post call to tt-judge
                request({
                    url: 'http://ttj.mybluemix.net/point',
                    method: 'POST', 
                    json: {
                        "player" : "right",
                        "pointType" : "not sure"
                    }
                }, function(error, response, body) {
                    if(error) {
                        console.log("Error: " + error);
                    } else {
                        //console.log(response.statusCode, body);
                    }
                });
                gameSequenceFinished = true;
                return;
            } else if(queue[i].leftOrRight == "right" && server == "left") {
                // go on
                state = 2;
                wouldBeWinner = "left";
                console.log("~~ GAME ~~: Left player played a correct serve. We continue. Would be winner is " + wouldBeWinner);
            } else if(queue[i].leftOrRight == "left" && server == "right") {
                // go on
                state = 3;
                wouldBeWinner = "right";
                console.log("~~ GAME ~~: Right player played a correct serve. We continue. Would be winner is " + wouldBeWinner);
            } else if(queue[i].leftOrRight == "right" && server == "right") {
                // point for left. Exit
                console.log("~~ GAME ~~: Right player hit his side twice. Point for player left.");
                // Post call to tt-judge
                request({
                    url: 'http://ttj.mybluemix.net/point',
                    method: 'POST', 
                    json: {
                        "player" : "left",
                        "pointType" : "not sure"
                    }
                }, function(error, response, body) {
                    if(error) {
                        console.log("Error: " + error);
                    } else {
                        //console.log(response.statusCode, body);
                    }
                });
                gameSequenceFinished = true;
                return;
            }
        }
        // State 2: Normal game mode. Next player to hit is right
        else if(state === 2) {
            if(queue[i].leftOrRight == "right") {
                // point for left. Exit.
                console.log("~~ GAME ~~: Player right played the ball onto his side. Point for left.");
                // Post call to tt-judge
                request({
                    url: 'http://ttj.mybluemix.net/point',
                    method: 'POST', 
                    json: {
                        "player" : "left",
                        "pointType" : "not sure"
                    }
                }, function(error, response, body) {
                    if(error) {
                        console.log("Error: " + error);
                    } else {
                        //console.log(response.statusCode, body);
                    }
                });
                gameSequenceFinished = true;
                return;
            } else if(queue[i].leftOrRight == "left") {
                // go on
                state = 3;
                wouldBeWinner = "right";
                console.log("~~ GAME ~~: Player right played the ball onto the other side. We continue. Would be winner is " + wouldBeWinner);
            }
        }
        // State 3: Normal game mode. Next player to hit is left
        else if(state === 3) {
            if(queue[i].leftOrRight == "left") {
                // point for right. Exit.
                console.log("~~ GAME ~~: Player left played the ball onto his side. Point for right.");
                // Post call to tt-judge
                request({
                    url: 'http://ttj.mybluemix.net/point',
                    method: 'POST', 
                    json: {
                        "player" : "right",
                        "pointType" : "not sure"
                    }
                }, function(error, response, body) {
                    if(error) {
                        console.log("Error: " + error);
                    } else {
                        //console.log(response.statusCode, body);
                    }
                });
                gameSequenceFinished = true;
                return;
            } else if(queue[i].leftOrRight == "right") {
                // go on
                state = 2;
                wouldBeWinner = "left";
                console.log("~~ GAME ~~: Player left played the ball onto the other side. We continue. Would be winner is: " + wouldBeWinner);
            }
        }
    }    
}

