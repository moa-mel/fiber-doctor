import { FiberClient } from '../rpc/fiber-client';
import { checkOfflinePeers } from '../rules/peer-offline';
import { checkOutboundLiquidity } from '../rules/insufficient-liquidity';
import { checkRoutingTopology } from '../rules/routing';

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
    } catch (e) {
      return {
        score: 0,
        checks: [{
          id: 'NODE_OFFLINE',
          status: 'fail',
          component: 'node',
          title: 'Fiber Background Process Offline',
          problem: 'Cannot contact local JSON-RPC socket.',
          recommendations: ['Initialize the node binary using your local shell environment script.']
        }]
      };
    }

    const peers = await this.client.listPeers().catch(() => []);
    const channels = await this.client.listChannels().catch(() => []);
    const payments = await this.client.listPayments().catch(() => []);
    const lastFailed = payments.filter((p: any) => p.status === 'Failed').pop();

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