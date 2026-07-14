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
        // Normalize wrapped responses. If the result is an object containing a key
        // that is the plural form of the method name (e.g., list_peers -> peers), return that array.
        const result = data.result;
        if (result && typeof result === 'object' && !Array.isArray(result)) {
            const expectedKey = method.replace('list_', ''); // e.g., 'list_peers' -> 'peers'
            if (expectedKey in result) {
                return result[expectedKey] ?? [];
            }
        }
        return result ?? [];
    }
    async listPayments() {
        // This method expects a parameter object inside a positional array.
        return this.call('list_payments', [{}]);
    }
    async getPayment(paymentHash) {
        return this.call('get_payment', { payment_hash: paymentHash });
    }
    async listChannels() {
        // Per API documentation, this method expects filter options inside a positional array.
        return this.call('list_channels', [{
                include_closed: false,
                only_pending: false,
            }]);
    }
    async listPeers() {
        // This method expects positional params and may return a wrapped response.
        return this.call('list_peers', []);
    }
    async nodeInfo() {
        return this.call('node_info', []);
    }
}
exports.FiberClient = FiberClient;
