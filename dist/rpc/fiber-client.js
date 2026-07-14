"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiberClient = void 0;
const axios_1 = __importDefault(require("axios"));
class FiberClient {
    constructor(url) {
        this.url = url;
    }
    async call(method, params = {}) {
        const { data } = await axios_1.default.post(this.url, {
            jsonrpc: '2.0',
            id: 1,
            method,
            params,
        });
        if (data.error) {
            throw new Error(`RPC Error: ${data.error.message}`);
        }
        return data.result;
    }
    async listPayments() {
        return this.call('list_payments');
    }
    async getPayment(paymentHash) {
        return this.call('get_payment', { payment_hash: paymentHash });
    }
    async listChannels() {
        return this.call('list_channels');
    }
    async listPeers() {
        return this.call('list_peers');
    }
    async nodeInfo() {
        return this.call('get_info');
    }
}
exports.FiberClient = FiberClient;
