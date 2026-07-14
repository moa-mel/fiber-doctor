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
    return data.result;
  }

  async listPayments(): Promise<any[]> {
    // This method expects a parameter object inside a positional array.
    // We normalize the response to ensure it's always an array.
    const result = await this.call('list_payments', [{}]);
    return Array.isArray(result) ? result : result.payments ?? [];
  }

  async getPayment(paymentHash: string): Promise<any> {
    return this.call('get_payment', { payment_hash: paymentHash });
  }

  async listChannels(): Promise<any[]> {
    // Per API documentation, this method expects filter options inside a positional array.
    // We also normalize the response to handle potentially wrapped objects.
    const result = await this.call('list_channels', [{
      include_closed: false,
      only_pending: false,
    }]);
    return Array.isArray(result) ? result : result.channels ?? [];
  }

  async listPeers(): Promise<any[]> {
    // This method expects positional params and may return a wrapped response.
    const result = await this.call('list_peers', []);
    return Array.isArray(result) ? result : result.peers ?? [];
  }

  async nodeInfo(): Promise<any> {
    const result = await this.call('node_info', []);
    return Array.isArray(result) ? result[0] : result;
  }
}