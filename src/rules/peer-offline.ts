import { DiagnosticResult } from '../diagnostics/node';

export function checkOfflinePeers(peers: any[], channels: any[]): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  // Filter for peers that are explicitly marked as connected.
  const activePeerPubkeys = new Set(
    peers.filter(p => p.connected === true).map(p => p.pubkey || p.peer_id)
  );

  // Use the same robust state checking we implemented for channel metrics.
  const READY_STATES = new Set([
    'Open',
    'CHANNEL_READY',
    'ChannelReady'
  ]);

  for (const channel of channels) {
    const peerPubkey = channel.pubkey || channel.peer_id;
    const stateName = channel.state?.state_name || channel.state;

    if (READY_STATES.has(stateName) && !activePeerPubkeys.has(peerPubkey)) {
      results.push({
        id: 'ERR_PEER_DISCONNECTED',
        status: 'warn',
        component: 'peers',
        title: `Inactive Channel Connection: Peer ${typeof peerPubkey === 'string' ? peerPubkey.substring(0, 8) : 'Unknown'}...`,
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