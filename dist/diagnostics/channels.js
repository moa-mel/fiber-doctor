"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelDiagnostics = void 0;
class ChannelDiagnostics {
    constructor(client) {
        this.client = client;
    }
    async getMetrics() {
        const channels = await this.client.listChannels().catch(() => []);
        // Set of states that are considered 'open' or 'ready' for use.
        const READY_STATES = new Set([
            'Open',
            'CHANNEL_READY', // As seen in Fiber v0.9.0-rc7
            'ChannelReady' // Adding case-variation for robustness
        ]);
        const open = channels.filter((c) => {
            const stateName = c.state?.state_name || c.state; // Handle both nested and flat state structures
            return READY_STATES.has(stateName);
        }).length;
        const pending = channels.length - open;
        return { total: channels.length, open, pending };
    }
}
exports.ChannelDiagnostics = ChannelDiagnostics;
