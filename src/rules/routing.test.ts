import { checkRoutingTopology } from './routing';

type Channel = {
  state: 'Pending' | 'Open' | 'Closed';
};
type Payment = { status?: string; error_code?: string | null };

describe('checkRoutingTopology', () => {
  it('should return null if there is no failed payment object', () => {
    const result = checkRoutingTopology([], undefined);
    expect(result).toBeNull();
  });

  it('should return null if the payment did not fail with a routing error', () => {
    const channels: Channel[] = [];
    const payment: Payment = { status: 'Success', error_code: null };
    const result = checkRoutingTopology(channels, payment);
    expect(result).toBeNull();
  });

  it('should return ERR_NO_ACTIVE_CHANNELS if payment failed and there are no open channels', () => {
    const channels: Channel[] = [{ state: 'Pending' }]; // No 'Open' channels
    const payment = { error_code: 'ROUTE_NOT_FOUND' };
    const result = checkRoutingTopology(channels, payment);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('ERR_NO_ACTIVE_CHANNELS');
    expect(result?.problem).toContain('cannot identify an available execution path');
  });

  it('should return null if payment failed but there is at least one open channel', () => {
    const channels: Channel[] = [{ state: 'Open' }];
    const payment = { error_code: 'ROUTE_NOT_FOUND' };
    const result = checkRoutingTopology(channels, payment);
    expect(result).toBeNull();
  });
});