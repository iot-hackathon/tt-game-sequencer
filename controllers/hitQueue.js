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

    console.log("DEBUG: Pushing into queue. queue has " + queue.length + " elements.");
    queue.push(ttHit);

    console.log("DEBUG: Sorting the queue. The queue has " + queue.length + " elements.");
    queue.sort(hitComparator);

    //console.log("DEBUG: Printing the queue: " + JSON.stringify(queue, null, 4));
    //console.log("DEBUG: Leaving newHit\n");
}


function evaluateQueueStability() {
    // auswerten ob die queue gerade stabil ist

    // spielzug auswertung
}



