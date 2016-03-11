'use strict';


/*==============================================================================
 * Variables and Imports
 *==============================================================================
 */

var queue = [];
var wellOrdered;



/*==============================================================================
 * Exports
 *==============================================================================
 */
module.exports = {

    "newHit" : newHit
};


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



