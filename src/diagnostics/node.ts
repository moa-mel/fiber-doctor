import { FiberClient } from '../rpc/fiber-client';
import { checkOfflinePeers } from '../rules/peer-offline';
import { checkNodeSync } from '../rules/node-synced';
import { checkOutboundLiquidity } from '../rules/insufficient-liquidity';
import { checkRoutingTopology } from '../rules/routing';
import { checkPeerLatency } from '../rules/peer-latency';

export interface DiagnosticResult {
  id: string;
  status: 'pass' | 'warn' | 'fail';
  component: 'node' | 'peers' | 'channels' | 'payments';
  title: string;
  problem?: string;
  reason?: string;
  educationalExplanation?: string;
  recommendations: string[];
}

/** Basic interfaces to improve type safety when processing RPC responses. */
export interface Peer {
  pubkey: string;
  peer_id: string;
  connected: boolean;
  ping_time?: number;
  state?: string;
  last_seen_at?: number; // Unix timestamp
}

export interface Channel {
  pubkey: string;
  peer_id: string;
  state: string | { state_name: string };
  local_balance?: string;
}

export interface Payment {
  status: 'succeeded' | 'failed' | 'pending' | 'Succeeded' | 'Failed' | 'Pending';
  payment_hash: string;
  amount?: string;
  error_code?: string | null;
  created_at: number; // Assuming a timestamp for sorting
}

export class NodeDiagnostics {
  private client: FiberClient;

  constructor(client: FiberClient) {
    this.client = client;
  }

  async runSuite(): Promise<{ score: number; checks: DiagnosticResult[] }> {
    const checks: DiagnosticResult[] = [];
    
    try {
      const nodeInfo = await this.client.nodeInfo();
      checks.push({
        id: 'NODE_ONLINE',
        status: 'pass',
        component: 'node',
        title: `Node Operational (${nodeInfo.version || 'vnn-stable'})`,
        recommendations: []
      });

      // Add back the sync check, which is critical for overall health.
      const syncCheck = checkNodeSync(nodeInfo.sync_state);
      if (syncCheck) {
        checks.push(syncCheck);
      }
    } catch (error) {
      // Re-throw the original error so the CLI can catch it and display debug info.
      throw error;
    }

    const peers: Peer[] = await this.client.listPeers().catch(err => {
      console.error("DEBUG: Failed to list peers", err); // Keep for debugging
      checks.push({
        id: 'PEER_FETCH_FAIL',
        status: 'warn',
        component: 'peers',
        title: 'Could not fetch peer data',
        problem: 'An RPC call to list_peers failed. Peer-related diagnostics may be incomplete.',
        recommendations: ['Ensure the node is fully synced and the RPC interface is stable.'],
      });
      return [];
    });

    const channels = await this.client.listChannels().catch(err => {
      console.error("DEBUG: Failed to list channels", err); // Keep for debugging
      checks.push({
        id: 'CHANNEL_FETCH_FAIL',
        status: 'warn',
        component: 'channels',
        title: 'Could not fetch channel data',
        problem: 'An RPC call to list_channels failed. Channel-related diagnostics may be incomplete.',
        recommendations: ['Ensure the node is fully synced and the RPC interface is stable.'],
      });
      return [];
    });

    const payments: Payment[] = await this.client.listPayments().catch(() => {
      // Silently fail on payments as it's less critical for a general health check.
      return [];
    });
    const lastFailed = payments
      .filter((p) => p.status?.toLowerCase() === 'failed')
      .sort((a, b) => b.created_at - a.created_at) // Sort by most recent
      .shift(); // Get the most recent failed payment

    // Run rules engine
    checks.push(...checkOfflinePeers(peers, channels));
    
    const liquidityIssue = checkOutboundLiquidity(channels, lastFailed);
    if (liquidityIssue) checks.push(liquidityIssue);

    const routingIssue = checkRoutingTopology(channels, lastFailed);
    if (routingIssue) checks.push(routingIssue);

    // Calculate score
    let score = 100;
    checks.forEach(c => {
      if (c.status === 'fail') score -= 25;
      if (c.status === 'warn') score -= 10;
    });

    return {
      score: Math.max(0, score),
      checks
    };
  }
}