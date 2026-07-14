// import { Command } from 'commander';
// import 'process';
// import { makeDiagnoseCommand } from './cli/diagnose';
// import { makeExplainCommand } from './cli/explain';
// import { makeReportCommand } from './cli/report';

// const program = new Command();

// program
//   .name('fiber-doctor')
//   .description('A structural analysis diagnostic and educational CLI utility for Nervos CKB Fiber Network Node operations.')
//   .version('1.0.0');

// // Inject child interfaces
// program.addCommand(makeDiagnoseCommand());
// program.addCommand(makeExplainCommand());
// program.addCommand(makeReportCommand());

// program.parse(process.argv);

import { Command } from 'commander';
import axios from 'axios';
import { checkOutboundLiquidity } from './rules/insufficient-liquidity';
import { checkOfflinePeers } from './rules/peer-offline';
import { checkRoutingTopology } from './rules/routing';
import { DiagnosticResult } from './diagnostics/node';

const program = new Command();

program
  .name('fiber-doctor')
  .description('A CLI tool to diagnose issues with a Fiber node.')
  .version('0.1.0');

program
  .command('diagnose')
  .description('Run diagnostics on a Fiber node')
  .option('--rpc-url <url>', 'Fiber node RPC URL', 'http://127.0.0.1:8118')
  .action(async (options) => {
    console.log(`Running diagnostics on node at ${options.rpcUrl}...`);

    try {
      // In a real implementation, you would make multiple RPC calls
      // For now, we'll use mock data to demonstrate the concept.
      // const { data: peers } = await axios.post(options.rpcUrl, { method: 'list_peers' });
      // const { data: channels } = await axios.post(options.rpcUrl, { method: 'list_channels' });
      // const { data: lastFailedPayment } = await axios.post(options.rpcUrl, { method: 'get_last_failed_payment' });

      // --- Mock Data for Demonstration ---
      const peers = [{ pubkey: 'abc' }]; // 'def' is offline
      const channels = [
        { state: 'Open', pubkey: 'abc', local_balance: '100000000' }, // 1 CKB
        { state: 'Open', pubkey: 'def', local_balance: '50000000' }, // 0.5 CKB
      ];
      const lastFailedPayment = { amount: '200000000', error_code: 'ROUTE_NOT_FOUND' }; // 2 CKB payment failed
      // --- End Mock Data ---

      const allDiagnostics: (DiagnosticResult | null)[] = [];

      // Run all diagnostic rules
      allDiagnostics.push(...checkOfflinePeers(peers, channels));
      allDiagnostics.push(checkRoutingTopology(channels, lastFailedPayment));
      allDiagnostics.push(checkOutboundLiquidity(channels, lastFailedPayment));

      const issues = allDiagnostics.filter((d) => d !== null);

      if (issues.length === 0) {
        console.log('\n✅ No issues found. Your Fiber node looks healthy!');
      } else {
        console.log(`\n🚨 Found ${issues.length} potential issue(s):`);
        issues.forEach((issue, index) => {
          console.log(`\n[${index + 1}] ${issue!.title}`);
          console.log(`   - Problem: ${issue!.problem}`);
          console.log(`   - Recommendation: ${issue!.recommendations[0]}`);
        });
      }
    } catch (error) {
      console.error('\n❌ Failed to connect to the Fiber node. Please ensure the RPC URL is correct and the node is running.');
    }
  });

program.parse(process.argv);