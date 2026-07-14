import { Command } from 'commander';
import chalk from 'chalk';
import 'process';
import { FiberClient } from '../rpc/fiber-client';
import { NodeDiagnostics } from '../diagnostics/node';
import { ChannelDiagnostics } from '../diagnostics/channels';
import { DEFAULT_RPC_URL, FIBER_RPC_URL_ENV_VAR } from '../config';

export function makeDiagnoseCommand(): Command {
  const command = new Command('diagnose');

  command
    .description('Execute a real-time status and health scan of the running Fiber node architecture')
    .option('--rpc-url <url>', 'Fiber node RPC URL to connect to', process.env[FIBER_RPC_URL_ENV_VAR] || DEFAULT_RPC_URL)
    .action(async (options) => {
      const url = options.rpcUrl;
      const client = new FiberClient(url);
      const diagnostics = new NodeDiagnostics(client);
      const channelDiag = new ChannelDiagnostics(client);

      console.log(chalk.cyan(`⚡ Running Suite on Core Node Protocol Endpoint: ${url}\n`));

      try {
        const report = await diagnostics.runSuite();
        const channelMetrics = await channelDiag.getMetrics();

        console.log(chalk.bold('--- Node Health Report ---'));
        
        const isOnline = report.checks.some(c => c.id === 'NODE_ONLINE' && c.status === 'pass');
        console.log(`Node Status:  ${isOnline ? chalk.green('✔ Running') : chalk.red('✖ Offline')}`);
        
        const openChannelsColor = channelMetrics.open > 0 ? chalk.green : chalk.yellow;
        console.log(`Channels:     ${openChannelsColor(`${channelMetrics.open} open`)}, ${channelMetrics.pending} pending`);
        
        const failedChecks = report.checks.filter(c => c.status === 'fail' || c.status === 'warn');
        console.log(`Alerts Flagged: ${failedChecks.length === 0 ? chalk.green('None') : chalk.yellow(failedChecks.length)}`);

        // Health score display
        let scoreColor = chalk.green;
        if (report.score < 80) scoreColor = chalk.yellow;
        if (report.score < 50) scoreColor = chalk.red;
        console.log(`Health Score: ${scoreColor(`${report.score}/100`)}\n`);

        if (failedChecks.length > 0) {
          console.log(chalk.bold.yellow('Action Summary Required:'));
          failedChecks.forEach(c => {
            const sym = c.status === 'fail' ? chalk.red('✖') : chalk.yellow('⚠');
            console.log(`  ${sym} [${c.component.toUpperCase()}] ${c.title}`);
            if (c.problem) console.log(chalk.dim(`     Context: ${c.problem}`));
          });
          console.log('');
        } else {
          console.log(chalk.green('✔ All evaluated runtime primitives conform to networking specifications!\n'));
        }
      } catch (error: any) {
        // If we can't connect at all, generate a synthetic failure report
        // for a consistent user experience.
        console.log(chalk.bold('--- Node Health Report ---'));
        console.log(`Node Status:  ${chalk.red('✖ Offline')}`);
        console.log(`Channels:     ${chalk.yellow('0 open')}, 0 pending`);
        console.log(`Alerts Flagged: ${chalk.yellow(1)}`);
        console.log(`Health Score: ${chalk.red('0/100')}\n`);

        console.log(chalk.bold.yellow('Action Summary Required:'));
        const syntheticFailure = {
          component: 'RPC',
          title: 'Cannot Connect to Node',
          problem: `Failed to establish a connection with the Fiber node at ${url}. The RPC endpoint is unreachable.`
        };
        console.log(`  ${chalk.red('✖')} [${syntheticFailure.component.toUpperCase()}] ${syntheticFailure.title}`);
        console.log(chalk.dim(`     Context: ${syntheticFailure.problem}`));
        console.log(chalk.dim(`\nEnsure your node is running and the RPC URL is correct.`));
      }
    });

  return command;
}