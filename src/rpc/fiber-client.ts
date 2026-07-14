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
    // Normalize wrapped responses centrally. If the result is an object with a single key
    // (e.g., { "channels": [...] }), return the value of that key. Otherwise, return the result directly.
    const result = data.result;
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      const keys = Object.keys(result);
      if (keys.length === 1) {
        return result[keys[0]] ?? [];
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