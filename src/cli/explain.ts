import { Command } from 'commander';
import chalk from 'chalk';
import 'process';
import { FiberClient } from '../rpc/fiber-client';
import { PaymentDiagnostics } from '../diagnostics/ payments';
import { DEFAULT_RPC_URL, FIBER_RPC_URL_ENV_VAR } from '../config';

export function makeExplainCommand(): Command {
  const explain = new Command('explain');

  explain
    .description('Translate and explain recent low-level Fiber errors into plain English')
    .option('--last-error', 'Analyze the most recent failed payment error')
    .option('--payment-hash <hash>', 'Analyze a specific failed payment hash')
    .action(async (options: { lastError?: boolean; paymentHash?: string }) => {
      const globalOptions = explain.parent?.opts() || {};
      const rpcClient = new FiberClient(globalOptions.rpcUrl ?? process.env[FIBER_RPC_URL_ENV_VAR] ?? DEFAULT_RPC_URL);
      const paymentDiag = new PaymentDiagnostics(rpcClient);

      try {
        let targetHash = options.paymentHash;

        if (options.lastError) {
          const recentPayments = await rpcClient.listPayments();
          const lastFailed = recentPayments
            .filter((p: any) => p.status === 'Failed' || p.status === 'failed')
            .pop();

          if (!lastFailed) {
            console.log(chalk.green('\n✔ No recent failed payments found in the node\'s history.'));
            return;
          } else {
            targetHash = lastFailed.payment_hash;
          }
        }

        if (!targetHash) {
          console.log(chalk.red('\n✖ Error: Provide options --last-error or --payment-hash <hash>.'));
          return;
        }

        // Verify the payment hash corresponds to a failed payment before explaining.
        const paymentDetails = await rpcClient.getPayment(targetHash);
        if (!paymentDetails) {
          console.log(chalk.red(`\n✖ Error: No payment found with hash: ${targetHash}`));
          return;
        }

        const status = paymentDetails.status?.toLowerCase();
        if (status !== 'failed') {
          console.log(chalk.green(`\n✔ Payment with hash ${targetHash} did not fail.`));
          console.log(`   - Status: ${paymentDetails.status}`);
          return;
        }

        const explanation = await paymentDiag.explainFailure(targetHash);

        console.log('\n' + chalk.bold.underline.yellow('Why did this happen?'));
        console.log(`\n${explanation.educationalExplanation}`);

        console.log('\n' + chalk.bold.red('Detailed Diagnosis'));
        console.log(`${chalk.bold('Problem:')} ${explanation.problem}`);
        console.log(`${chalk.bold('Reason:')}  ${explanation.reason}`);

        console.log('\n' + chalk.bold.green('💡 Actionable Recommendations'));
        explanation.recommendations.forEach((rec: string) => {
          console.log(` • ${rec}`);
        });
        console.log('\n');

      } catch (error: any) {
        console.error(chalk.red(`\n✖ Runtime Fault running diagnostics: ${error.message}`));
      }
    });

  return explain;
}