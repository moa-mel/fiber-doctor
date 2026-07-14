"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiberClient = void 0;
const axios_1 = __importDefault(require("axios"));
class FiberClient {
    constructor(url, timeout = 10000) {
        this.url = url;
        this.timeout = timeout;
    }
    async call(method, params = []) {
        const requestPayload = {
            jsonrpc: '2.0',
            id: 1,
            method,
            params,
        };
        const { data } = await axios_1.default.post(this.url, requestPayload, { timeout: this.timeout });
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
    async listPayments() {
        // This method expects a parameter object inside a positional array.
        // We normalize the response to ensure it's always an array.
        const result = await this.call('list_payments', [{}]);
        return Array.isArray(result) ? result : result.payments ?? [];
    }
    async getPayment(paymentHash) {
        return this.call('get_payment', { payment_hash: paymentHash });
    }
    async listChannels() {
        // Per API documentation, this method expects filter options inside a positional array.
        // We also normalize the response to handle potentially wrapped objects.
        const result = await this.call('list_channels', [{
                include_closed: false,
                only_pending: false,
            }]);
        return Array.isArray(result) ? result : result.channels ?? [];
    }
    async listPeers() {
        // This method expects positional params and may return a wrapped response.
        const result = await this.call('list_peers', []);
        return Array.isArray(result) ? result : result.peers ?? [];
    }
    async nodeInfo() {
        const result = await this.call('node_info', []);
        return Array.isArray(result) ? result[0] : result;
    }
}
exports.FiberClient = FiberClient;
