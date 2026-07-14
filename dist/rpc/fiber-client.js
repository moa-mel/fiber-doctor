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
        };
        // Only include the 'params' key if it's a non-empty array or an object with keys.
        if ((Array.isArray(params) && params.length > 0) || (typeof params === 'object' && !Array.isArray(params) && Object.keys(params).length > 0)) {
            requestPayload.params = params;
        }
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
        return this.call('list_payments', {});
    }
    async getPayment(paymentHash) {
        return this.call('get_payment', { payment_hash: paymentHash });
    }
    async listChannels() {
        return this.call('list_channels', {});
    }
    async listPeers() {
        return this.call('list_peers', []); // This method expects positional params
    }
    async nodeInfo() {
        return this.call('node_info', []);
    }
}
exports.FiberClient = FiberClient;
