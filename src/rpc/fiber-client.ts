import axios from 'axios';

export class FiberClient {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  private async call(method: string, params: any = {}) {
    const { data } = await axios.post(this.url, {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    });
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }
    return data.result;
  }

  async listPayments(): Promise<any[]> {
    return this.call('list_payments');
  }

  async getPayment(paymentHash: string): Promise<any> {
    return this.call('get_payment', { payment_hash: paymentHash });
  }

  async listChannels(): Promise<any[]> {
    return this.call('list_channels');
  }

  async listPeers(): Promise<any[]> {
    return this.call('list_peers');
  }

  async nodeInfo(): Promise<any> {
    return this.call('get_info');
  }
}