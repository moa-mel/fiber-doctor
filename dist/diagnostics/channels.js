"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelDiagnostics = void 0;
class ChannelDiagnostics {
    constructor(client) {
        this.client = client;
    }
    async getMetrics() {
        const channels = await this.client.listChannels().catch(() => []);
        const open = channels.filter(c => c.state === 'Open').length;
        const pending = channels.filter(c => c.state !== 'Open').length;
        return { total: channels.length, open, pending };
    }
}
exports.ChannelDiagnostics = ChannelDiagnostics;
