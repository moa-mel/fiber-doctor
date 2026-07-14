import axios from 'axios';

export class FiberClient {
  private url: string;
  private timeout: number;

  constructor(url: string, timeout: number = 10000) {
    this.url = url;
    this.timeout = timeout;
  }

  private async call(method: string, params: any[] | object = []) {
    const requestPayload: any = {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    };
    const { data } = await axios.post(
      this.url,
      requestPayload,
      { timeout: this.timeout }
    );
    if (data.error) {
      console.log({
        method,
        request: requestPayload,
        response: data,
      });
      throw new Error(`${method}: ${data.error.message}`);
    }
    // Normalize wrapped responses. If the result is an object containing a key
    // that is the plural form of the method name (e.g., list_peers -> peers), return that array.
    const result = data.result;
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      const expectedKey = method.replace('list_', ''); // e.g., 'list_peers' -> 'peers'
      if (expectedKey in result) {
        return result[expectedKey] ?? [];
      }
    }
    return result ?? [];
  }

  async listPayments(): Promise<any[]> {
    // This method expects a parameter object inside a positional array.
    return this.call('list_payments', [{}]);
  }

  async getPayment(paymentHash: string): Promise<any> {
    return this.call('get_payment', { payment_hash: paymentHash });
  }

  async listChannels(): Promise<any[]> {
    // Per API documentation, this method expects filter options inside a positional array.
    return this.call('list_channels', [{
      include_closed: false,
      only_pending: false,
    }]);
  }

  async listPeers(): Promise<any[]> {
    // This method expects positional params and may return a wrapped response.
    return this.call('list_peers', []);
  }

  async nodeInfo(): Promise<any> {
    return this.call('node_info', []);
  }
}