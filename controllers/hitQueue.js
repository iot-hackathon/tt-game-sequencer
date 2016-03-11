'use strict';


/*==============================================================================
 * Variables and Imports
 *==============================================================================
 */

var queue = [];
var server;



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
function resetQueue() {
    console.log("DEBUG: resetQueue");
    queue = [];
}

// *****
// Compare Function for hits (should allow sort an array of hits by sequence Count)
// *****
function hitComparator(hitA, hitB) {
    // console.log("DEBUG: hitComparator called with " +  JSON.stringify(hitA) + " and " + JSON.stringify(hitB));
    return parseInt(hitA.seqCount) - parseInt(hitB.seqCount);
}

/*==============================================================================
 * Functions
 *==============================================================================
 */

// *****
// Include a new hit in the queue and trigger follow-up events
// *****
function newHit(ttHit) {

    console.log("DEBUG: Entering newHit\n");

    console.log("DEBUG: Pushing into queue. queue has " + queue.length + " elements.\n");
    queue.push(ttHit);

    console.log("DEBUG: Sorting the queue. The queue has " + queue.length + " elements.\n");
    queue.sort(hitComparator);

    //console.log("DEBUG: Printing the queue: " + JSON.stringify(queue, null, 4));
    //console.log("DEBUG: Leaving newHit\n");
}

// *****
// Evaluate whether there are gaps in the queue. If so, do nothing, otherwise tirgger an evaluation
// cycle (asynchronously) 
// *****
function evaluateQueueStability() {

    // Check whether the queue contains gaps
    var initialCount = queue[0].seqCount;
    console.log("DEBUG: Currently the queue starts at the offset of " + initialCount);

    for(var i = 1; i<queue.length; i++) {
        var nextCount = initialCount + i;
        if(!(nextCount == queue[i].seqCount)) {
            console.log("DEBUG: Expected the element at position " + i + " to have the sequence count of " + nextCount + " but found " + queue[i].seqCount +  " instead.\n");
            wellOrderd = false;
            return;
        } else {
            console.log("DEBUG: Sequence is ordered so far…\n");
        }
    }

    console.log("DEBUG: Sequence is completely ordered, calling the evaluator\n");

    evaluator();
    console.log("DEBUG: Test statement for async state of call. Should be called immediately\n");
}

// *****
// Check the queue whether it contains events which lead to a complete game sequence 
// *****
function evaluator() {

    var state = 0;

    for(var i=0; i<queue.length; i++) {

        // State 0: Nothing has happened after initializing the game sequence
        if(state === 0) {
            if(queue[i].leftOrRight == "left" && server == "left") {
                state = 1;
                // go on
                console.log("DEBUG: Left player served and played to left side first. We continue.\n");
            } else if(queue[i].leftOrRight == "right" && server == "left") {
                // point for right. Exit
                console.log("DEBUG: Left player served and played directly to the right side. Point for player right.\n");
                // call the other micro service
                return;
            } else if(queue[i].leftOrRight == "left" && server == "right") {
                // point for left. Exit
                console.log("DEBUG: Right player served and played directly to the left side. Point for player left.\n");
                // call the other micro service
                return;
            } else if(queue[i].leftOrRight == "right" && server == "right") {
                state = 1;
                // go on
                console.log("DEBUG: Right player served and played to right side first. We continue.\n");
            }             
        } 
        // State 1: Player hit his side first
        else if (state === 1) {

            if(queue[i].leftOrRight == "left" && server == "left") {
                // point for right. Exit
                console.log("DEBUG: Left player hit his side twice. Point for player right.\n");
                // TODO call the other micro service
                return;
            } else if(queue[i].leftOrRight == "right" && server == "left") {
                // go on
                state = 2;
                console.log("DEBUG: Left player played a correct serve. We continue.\n");
            } else if(queue[i].leftOrRight == "left" && server == "right") {
                // go on
                state = 3;
                console.log("DEBUG: Right player played a correct serve. We continue.\n");
            } else if(queue[i].leftOrRight == "right" && server == "right") {
                // point for left. Exit
                console.log("DEBUG: Right player hit his side twice. Point for player left.\n");
                // TODO call the other micro service
                return;
            }
        }
        // State 2: Normal game mode. Next player to hit is right
        else if(state === 2) {
            if(queue[i].leftOrRight == "right") {
                // point for left. Exit.
                console.log("DEBUG: Player right played the ball onto his side. Point for left.\n");
                // TODO call the other micro service
                return;
            } else if(queue[i].leftOrRight == "left") {
                // go on
                state = 3;
                console.log("DEBUG: Player right played the ball onto the other side. We continue.\n");
            }
        }
        // State 3: Normal game mode. Next player to hit is left
        else if(state === 3) {
            if(queue[i].leftOrRight == "left") {
                // point for right. Exit.
                console.log("DEBUG: Player left played the ball onto his side. Point for right.\n");
                // TODO call the other micro service
                return;
            } else if(queue[i].leftOrRight == "right") {
                // go on
                state = 2;
                console.log("DEBUG: Player left played the ball onto the other side. We continue.\n");
            }
        }
    }    
}

