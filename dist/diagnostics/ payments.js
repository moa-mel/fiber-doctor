"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentDiagnostics = void 0;
const insufficient_liquidity_1 = require("../rules/insufficient-liquidity");
const routing_1 = require("../rules/routing");
class PaymentDiagnostics {
    constructor(client) {
        this.client = client;
    }
    async explainFailure(hash) {
        const channels = await this.client.listChannels().catch(() => []);
        const payments = await this.client.listPayments().catch(() => []);
        const targetPayment = payments.find((p) => p.payment_hash === hash);
        if (!targetPayment) {
            return {
                id: 'ERR_PAYMENT_NOT_FOUND',
                status: 'fail',
                component: 'payments',
                title: 'Payment Hash Not Found',
                problem: `The payment hash "${hash.substring(0, 16)}..." does not exist in the node's payment history.`,
                reason: 'The payment may have been initiated on a different node, or the node\'s payment history may have been cleared.',
                recommendations: ['Verify you are connected to the correct Fiber node.', 'Ensure the payment hash is correct and was initiated by this node.']
            };
        }
        const liquidityCheck = (0, insufficient_liquidity_1.checkOutboundLiquidity)(channels, targetPayment);
        if (liquidityCheck)
            return liquidityCheck;
        const routingCheck = (0, routing_1.checkRoutingTopology)(channels, targetPayment);
        if (routingCheck)
            return routingCheck;
        return {
            id: 'ERR_UNKNOWN_ROUTING_FAIL',
            status: 'fail',
            component: 'payments',
            title: 'Generic Execution Interruption',
            problem: 'The transaction encountered an internal validation issue along the route.',
            reason: 'The intermediate node script rejected the pathing hash format or returned an invalid expiry window.',
            educationalExplanation: 'Multi-hop swaps rely on chronological constraints. If intermediate channel nodes run out of unspent cells or lag behind the CKB block validation height, payment packages expire automatically.',
            recommendations: ['Generate a clean payment request string and retry context setup.']
        };
    }
}
exports.PaymentDiagnostics = PaymentDiagnostics;
