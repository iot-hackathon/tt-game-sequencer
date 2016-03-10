'use strict';


/*==============================================================================
 * Variables and Imports
 *==============================================================================
 */

var queue = [];




/*==============================================================================
 * Exports
 *==============================================================================
 */
module.exports = {

    "newHit" : newHit
};



/*==============================================================================
 * Functions
 *==============================================================================
 */
function newHit(ttHit) {

    console.log("DEBUG: Entering newHit\n");

    console.log("DEBUG: Pushing into queue. queue has " + queue.lastIndexOf + " elements.");
    queue.push(ttHit);

    console.log("DEBUG: Sorting the queue. The queue has " + queue.lastIndexOf + " elements.");
    queue.sort(hitComparator);

    console.log("DEBUG: Printing the queue: " + queue);


    console.log("DEBUG: Leaving newHit\n");
}






// Compare Function for hits (should allow sort an array of hits by sequence Count)
function hitComparator(hitA, hitB) {
    return parseInt(hitA.secCount) - parseInt(hitB.secCount);
}