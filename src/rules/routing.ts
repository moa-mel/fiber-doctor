import { DiagnosticResult } from '../diagnostics/node';

export function checkRoutingTopology(channels: any[], lastFailedPayment?: any): DiagnosticResult | null {
  if (!lastFailedPayment) return null;
  
  // Only check for routing errors if a route could not be found.
  if (lastFailedPayment.error_code === 'ROUTE_NOT_FOUND') {
    const activeChannels = channels.filter(c => c.state === 'Open').length;
    
    if (activeChannels === 0) {
      return {
        id: 'ERR_NO_ACTIVE_CHANNELS',
        status: 'fail',
        component: 'channels',
        title: 'Zero Active Paths Discovered',
        problem: 'Your application cannot identify an available execution path.',
        reason: 'You do not possess any running channels currently in an Open state.',
        educationalExplanation: 'Fiber acts as a graph-based off-chain protocol. Transactions cannot hop to the wider CKB system without a direct open link to at least one entry peer on the topological graph.',
        recommendations: [
          'Generate a channel initialization command to lock up testnet funds with a reliable hub.',
          'Verify your CKB cell wallet status to ensure you have base layer validation capacity.'
        ]
      };
    }
  }
  return null;
}