"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeDiagnostics = void 0;
const peer_offline_1 = require("../rules/peer-offline");
const node_synced_1 = require("../rules/node-synced");
const insufficient_liquidity_1 = require("../rules/insufficient-liquidity");
const routing_1 = require("../rules/routing");
class NodeDiagnostics {
    constructor(client) {
        this.client = client;
    }
    async runSuite() {
        const checks = [];
        try {
            const nodeInfo = await this.client.nodeInfo();
            checks.push({
                id: 'NODE_ONLINE',
                status: 'pass',
                component: 'node',
                title: `Node Operational (${nodeInfo.version || 'vnn-stable'})`,
                recommendations: []
            });
            // Add back the sync check, which is critical for overall health.
            const syncCheck = (0, node_synced_1.checkNodeSync)(nodeInfo.sync_state);
            if (syncCheck) {
                checks.push(syncCheck);
            }
        }
        catch (error) {
            // Re-throw the original error so the CLI can catch it and display debug info.
            throw error;
        }
        // The `listPeers` method in this node version returns an object like `{ peers: [...] }`.
        // We need to extract the array.
        const peersResponse = await this.client.listPeers().catch(() => {
            checks.push({
                id: 'PEER_FETCH_FAIL',
                status: 'warn',
                component: 'peers',
                title: 'Could not fetch peer data',
                problem: 'An RPC call to list_peers failed. Peer-related diagnostics may be incomplete.',
                recommendations: ['Ensure the node is fully synced and the RPC interface is stable.'],
            });
            return { peers: [] }; // Return the expected object shape on failure.
        });
        // Safely unwrap the response. If it's an object with a `peers` property, use that.
        // Otherwise, assume the response itself is the array.
        const peers = (peersResponse && typeof peersResponse === 'object' && !Array.isArray(peersResponse) && 'peers' in peersResponse)
            ? peersResponse.peers : (peersResponse || []);
        // Assuming listChannels might also return a wrapped object, though the error was on peers.
        const channelsResponse = await this.client.listChannels().catch(() => {
            checks.push({
                id: 'CHANNEL_FETCH_FAIL',
                status: 'warn',
                component: 'channels',
                title: 'Could not fetch channel data',
                problem: 'An RPC call to list_channels failed. Channel-related diagnostics may be incomplete.',
                recommendations: ['Ensure the node is fully synced and the RPC interface is stable.'],
            });
            return { channels: [] };
        });
        // Apply the same safe unwrapping logic for channels.
        const channels = (channelsResponse && typeof channelsResponse === 'object' && !Array.isArray(channelsResponse) && 'channels' in channelsResponse)
            ? channelsResponse.channels : (channelsResponse || []);
        const payments = await this.client.listPayments().catch(() => {
            // Silently fail on payments as it's less critical for a general health check.
            return [];
        });
        const lastFailed = payments.filter((p) => p.status === 'Failed').pop();
        // Run rules engine
        checks.push(...(0, peer_offline_1.checkOfflinePeers)(peers, channels));
        const liquidityIssue = (0, insufficient_liquidity_1.checkOutboundLiquidity)(channels, lastFailed);
        if (liquidityIssue)
            checks.push(liquidityIssue);
        const routingIssue = (0, routing_1.checkRoutingTopology)(channels, lastFailed);
        if (routingIssue)
            checks.push(routingIssue);
        // Calculate score
        let score = 100;
        checks.forEach(c => {
            if (c.status === 'fail')
                score -= 25;
            if (c.status === 'warn')
                score -= 10;
        });
        return {
            score: Math.max(0, score),
            checks
        };
    }
}
exports.NodeDiagnostics = NodeDiagnostics;
