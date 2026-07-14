import { DiagnosticResult } from '../diagnostics/node';

export function checkOutboundLiquidity(channels: any[], lastFailedPayment?: any): DiagnosticResult | null {
  if (!lastFailedPayment) return null;

  const paymentAmount = BigInt(lastFailedPayment.amount || 0);
  let maxOutboundCapacity = BigInt(0);

  for (const channel of channels) {
    if (channel.state === 'Open') {
      const localBalance = BigInt(channel.local_balance || 0);
      if (localBalance > maxOutboundCapacity) {
        maxOutboundCapacity = localBalance;
      }
    }
  }

  if (paymentAmount > maxOutboundCapacity) {
    // Conversion to standard human-readable format assuming Shannons format (1 CKB = 10^8 Shannons)
    const requiredCkb = (Number(paymentAmount) / 1e8).toFixed(2);
    const availableCkb = (Number(maxOutboundCapacity) / 1e8).toFixed(2);

    return {
      id: 'ERR_INSUFFICIENT_OUTBOUND_LIQUIDITY',
      status: 'fail',
      component: 'channels',
      title: 'Insufficient Outbound Liquidity',
      problem: 'Your routing channels do not have enough outbound capacity to execute this transaction.',
      reason: `The payment requested ${requiredCkb} CKB, but your largest active channel only possesses ${availableCkb} CKB in local balance.`,
      educationalExplanation: 'Payment channels are strictly directional. While your channel may contain enough total funds combined, only the outbound balance (local_balance) can be deployed to push payments from your local node.',
      recommendations: [
        'Initiate a liquidity rebalance protocol using a submarine swap gateway.',
        'Establish an additional payment channel with a highly liquid network peer or public relay.',
        'Lower your overall payment denomination thresholds and retry.'
      ]
    };
  }

  return null;
}