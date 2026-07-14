import axios from 'axios';
import { DiagnosticResult } from '../diagnostics/node';

const CKB_INDEXER_URL = 'https://testnet.ckbapp.dev/';

/**
 * Checks if the CKB testnet indexer is reachable.
 * The Fiber node depends on this service to verify on-chain transactions.
 */
export async function checkCkbIndexerConnectivity(): Promise<DiagnosticResult | null> {
  try {
    // Perform a simple HEAD request to check for connectivity without downloading content.
    await axios.head(CKB_INDEXER_URL, { timeout: 15000 });
    return null; // Connection successful
  } catch (error: any) {
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