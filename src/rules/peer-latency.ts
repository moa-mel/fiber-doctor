import { DiagnosticResult, Peer } from '../diagnostics/node';

const LATENCY_THRESHOLD_MS = 1000; // 1 second

export function checkPeerLatency(peers: Peer[]): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  for (const peer of peers) {
    // Assuming the peer object has a `ping_time` field in milliseconds.
    const latency = peer.ping_time;

    if (peer.connected && typeof latency === 'number' && latency > LATENCY_THRESHOLD_MS) {
      results.push({
        id: 'WARN_PEER_HIGH_LATENCY',
        status: 'warn',
        component: 'peers',
        title: `High Latency to Peer: ${typeof peer.pubkey === 'string' ? peer.pubkey.substring(0, 8) : 'Unknown'}...`,
        problem: `The connection to this peer is slow (${latency}ms), which may impact payment routing speed and reliability.`,
        reason: 'High latency can be caused by network congestion, geographical distance to the peer, or poor performance of the remote node.',
        educationalExplanation: 'While the peer is connected, high latency means that communication for forwarding payments (HTLCs) will be delayed. This increases the risk of timeouts and payment failures when this peer is part of a payment route.',
        recommendations: ['No immediate action is required, but consider finding a lower-latency peer if payment failures occur.', 'If you control the remote node, investigate its network connection and system load.'],
      });
    }
  }

  return results;
}