"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCkbIndexerConnectivity = checkCkbIndexerConnectivity;
const axios_1 = __importDefault(require("axios"));
const CKB_INDEXER_URL = 'https://testnet.ckbapp.dev/';
/**
 * Checks if the CKB testnet indexer is reachable.
 * The Fiber node depends on this service to verify on-chain transactions.
 */
async function checkCkbIndexerConnectivity() {
    try {
        // Perform a simple HEAD request to check for connectivity without downloading content.
        await axios_1.default.head(CKB_INDEXER_URL, { timeout: 15000 });
        return null; // Connection successful
    }
    catch (error) {
        return {
            id: 'ERR_CKB_INDEXER_UNREACHABLE',
            status: 'warn',
            component: 'node',
            title: 'CKB Indexer Unreachable',
            problem: `The diagnostic tool could not establish a connection to the CKB testnet indexer at ${CKB_INDEXER_URL}.`,
            reason: `This may be due to a network issue, a firewall, or a temporary outage of the indexer service. The error received was: ${error.message}`,
            educationalExplanation: 'The Fiber node needs to communicate with a CKB Indexer to validate on-chain data, such as channel funding transactions. If the indexer is unreachable, the node cannot sync its view of the network graph correctly.',
            recommendations: [
                'Verify your internet connection and ensure you can access https://testnet.ckbapp.dev/ from your browser or using `curl`.',
                'Check if any firewall or proxy is blocking outbound connections to the indexer.',
                'If the issue persists, the CKB testnet indexer service may be temporarily down. You can check community channels for status updates.'
            ]
        };
    }
}
