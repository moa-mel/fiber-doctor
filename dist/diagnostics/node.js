"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeDiagnostics = void 0;
const peer_offline_1 = require("../rules/peer-offline");
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
        }
        catch (e) {
            return {
                score: 0,
                checks: [{
                        id: 'NODE_OFFLINE',
                        status: 'fail',
                        component: 'node',
                        title: 'Fiber Background Process Offline',
                        problem: 'Cannot contact local JSON-RPC socket.',
                        recommendations: ['Initialize the node binary using your local shell environment script.']
                    }]
            };
        }
        const peers = await this.client.listPeers().catch(() => []);
        const channels = await this.client.listChannels().catch(() => []);
        const payments = await this.client.listPayments().catch(() => []);
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
