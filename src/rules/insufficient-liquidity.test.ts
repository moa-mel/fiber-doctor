import { checkOutboundLiquidity } from './insufficient-liquidity';

type Channel = {
  state: 'Pending' | 'Open' | 'Closed';
  local_balance?: string;
};

type Payment = {
  amount?: string;
};

describe('checkOutboundLiquidity', () => {
  it('should return null if there is no failed payment', () => {
    const channels: Channel[] = [];
    const result = checkOutboundLiquidity(channels, undefined);
    expect(result).toBeNull();
  });

  it('should return null if outbound liquidity is sufficient', () => {
    const channels: Channel[] = [
      { state: 'Open', local_balance: '100000000' }, // 1 CKB
    ];
    const payment: Payment = { amount: '50000000' }; // 0.5 CKB
    const result = checkOutboundLiquidity(channels, payment);
    expect(result).toBeNull();
  });

  it('should return ERR_INSUFFICIENT_OUTBOUND_LIQUIDITY if payment amount exceeds max local balance', () => {
    const channels: Channel[] = [
      { state: 'Open', local_balance: '50000000' }, // 0.5 CKB
      { state: 'Open', local_balance: '20000000' }, // 0.2 CKB
    ];
    const payment: Payment = { amount: '100000000' }; // 1 CKB
    const result = checkOutboundLiquidity(channels, payment);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('ERR_INSUFFICIENT_OUTBOUND_LIQUIDITY');
    expect(result?.reason).toContain('The payment requested 1.00 CKB, but your largest active channel only possesses 0.50 CKB');
  });
});