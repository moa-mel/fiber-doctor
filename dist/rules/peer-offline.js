"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOfflinePeers = checkOfflinePeers;
function checkOfflinePeers(peers, channels) {
    const results = [];
    const activePeerPubkeys = new Set(peers.map(p => p.pubkey || p.peer_id));
    for (const channel of channels) {
        const peerPubkey = channel.pubkey || channel.peer_id;
        if (channel.state === 'Open' && !activePeerPubkeys.has(peerPubkey)) {
            results.push({
                id: 'ERR_PEER_DISCONNECTED',
                status: 'warn',
                component: 'peers',
                title: `Inactive Channel Connection: Peer ${peerPubkey.substring(0, 8)}...`,
                problem: 'Structural channel state is designated open, but the remote node connection is dead.',
                reason: 'The node endpoint is currently unreachable or has terminated its P2P handshake with your environment.',
                educationalExplanation: 'Fiber routing mechanisms require active network sockets across all intermediary channels. If an open channel partner logs offline, its locked capacity becomes unusable for multi-hop pathfinding.',
                recommendations: [
                    `Manually execute a new network connection command to peer node: ${peerPubkey}`,
                    'Wait for the automated node engine retry interval to re-establish peer handshakes.',
                    'If the peer remains offline permanently, prepare to submit a mutual or unilateral closing transaction.'
                ]
            });
        }
    }
    return results;
}
