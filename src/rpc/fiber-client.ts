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
    };
    // Only include the 'params' key if it's a non-empty array or an object with keys.
    if ((Array.isArray(params) && params.length > 0) || (typeof params === 'object' && !Array.isArray(params) && Object.keys(params).length > 0)) {
      requestPayload.params = params;
    }
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
    return this.call('list_payments', {});
  }

  async getPayment(paymentHash: string): Promise<any> {
    return this.call('get_payment', { payment_hash: paymentHash });
  }

  async listChannels(): Promise<any[]> {
    return this.call('list_channels', {});
  }

  async listPeers(): Promise<any[]> {
    return this.call('list_peers', []); // This method expects positional params
  }

  async nodeInfo(): Promise<any> {
    return this.call('node_info', []);
  }
}