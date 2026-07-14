import axios from 'axios';

export class FiberClient {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  private async callRpc(method: string, params: any[] = []): Promise<any> {
    try {
      const response = await axios.post(
        this.url,
        {
          id: Date.now(),
          jsonrpc: '2.0',
          method,
          params,
        },
        { timeout: 3000 }
      );
      if (response.data.error) {
        throw new Error(response.data.error.message || JSON.stringify(response.data.error));
      }
      return response.data.result;
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED') {
        throw new Error(`Could not connect to Fiber Node at ${this.url}. Is the fnn daemon running?`);
      }
      throw err;
    }
  }

  // Fetches the node's public key, multi-addresses, and network services
  async nodeInfo(): Promise<any> {
    return this.callRpc('get_node_info');
  }

  // Lists connected network peers
  async listPeers(): Promise<any[]> {
    const res = await this.callRpc('get_peers');
    return res?.peers || [];
  }

  // Retrieves active payment channels open on this node
  async listChannels(): Promise<any[]> {
    const res = await this.callRpc('list_channels');
    return res?.channels || [];
  }

  // Pulls network routing graph state to check topology alignment
  async getRouterGraph(): Promise<any> {
    return this.callRpc('graph_nodes');
  }

  // Retrieves a list of historical payments
  async listPayments(): Promise<any[]> {
    return await this.callRpc('list_payments') || [];
  }
}