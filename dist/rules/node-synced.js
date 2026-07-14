"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNodeSync = checkNodeSync;
/**
 * Checks if the Fiber node is fully synchronized with the CKB blockchain.
 * A node cannot safely open channels or process on-chain transactions
 * if it is still in Initial Block Download (IBD).
 */
function checkNodeSync(syncState) {
    if (!syncState || !syncState.ibd) {
        // If syncState is not available or IBD is false, we assume it's synced.
        return null;
    }
    return {
        id: 'ERR_NODE_NOT_SYNCED',
        status: 'fail',
        component: 'node',
        title: 'Node is Not Synchronized',
        problem: 'Your Fiber node is currently performing an Initial Block Download (IBD) and is not fully synced with the CKB blockchain.',
        recommendations: [
            'Wait for the node to complete synchronization before attempting to open channels or make payments. You can monitor its progress through the node logs.',
            'Ensure your node has a stable internet connection and can connect to CKB network peers.'
        ]
    };
}
