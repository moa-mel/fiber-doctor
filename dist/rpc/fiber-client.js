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
    async callRpc(method, params = []) {
        try {
            const response = await axios_1.default.post(this.url, {
                id: Date.now(),
                jsonrpc: '2.0',
                method,
                params,
            }, { timeout: 3000 });
            if (response.data.error) {
                throw new Error(response.data.error.message || JSON.stringify(response.data.error));
            }
            return response.data.result;
        }
        catch (err) {
            if (err.code === 'ECONNREFUSED') {
                throw new Error(`Could not connect to Fiber Node at ${this.url}. Is the fnn daemon running?`);
            }
            throw err;
        }
    }
    // Fetches the node's public key, multi-addresses, and network services
    async nodeInfo() {
        return this.callRpc('get_node_info');
    }
    // Lists connected network peers
    async listPeers() {
        const res = await this.callRpc('get_peers');
        return res?.peers || [];
    }
    // Retrieves active payment channels open on this node
    async listChannels() {
        const res = await this.callRpc('list_channels');
        return res?.channels || [];
    }
    // Pulls network routing graph state to check topology alignment
    async getRouterGraph() {
        return this.callRpc('graph_nodes');
    }
    // Retrieves a list of historical payments
    async listPayments() {
        return await this.callRpc('list_payments') || [];
    }
}
exports.FiberClient = FiberClient;
