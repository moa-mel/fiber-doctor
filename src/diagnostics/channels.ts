import { FiberClient } from '../rpc/fiber-client';

export class ChannelDiagnostics {
  private client: FiberClient;

  constructor(client: FiberClient) {
    this.client = client;
  }

  async getMetrics() {
    const channels = await this.client.listChannels().catch(() => []);
    const open = channels.filter(c => c.state === 'Open').length;
    const pending = channels.filter(c => c.state !== 'Open').length;

    return { total: channels.length, open, pending };
  }
}