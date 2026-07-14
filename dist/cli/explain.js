"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeExplainCommand = makeExplainCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
require("process");
const fiber_client_1 = require("../rpc/fiber-client");
const _payments_1 = require("../diagnostics/ payments");
const config_1 = require("../config");
function makeExplainCommand() {
    const explain = new commander_1.Command('explain');
    explain
        .description('Translate and explain recent low-level Fiber errors into plain English')
        .option('--last-error', 'Analyze the most recent failed payment error')
        .option('--payment-hash <hash>', 'Analyze a specific failed payment hash')
        .action(async (options) => {
        const rpcClient = new fiber_client_1.FiberClient(process.env[config_1.FIBER_RPC_URL_ENV_VAR] || config_1.DEFAULT_RPC_URL);
        const paymentDiag = new _payments_1.PaymentDiagnostics(rpcClient);
        try {
            let targetHash = options.paymentHash;
            if (options.lastError) {
                const recentPayments = await rpcClient.listPayments();
                const lastFailed = recentPayments
                    .filter((p) => p.status === 'Failed' || p.status === 'failed')
                    .pop();
                if (!lastFailed) {
                    console.log(chalk_1.default.green('\n✔ No recent failed payments found in the node\'s history.'));
                    return;
                }
                else {
                    targetHash = lastFailed.payment_hash;
                }
            }
            if (!targetHash) {
                console.log(chalk_1.default.red('\n✖ Error: Provide options --last-error or --payment-hash <hash>.'));
                return;
            }
            const explanation = await paymentDiag.explainFailure(targetHash);
            console.log('\n' + chalk_1.default.bold.underline.yellow('Why did this happen?'));
            console.log(`\n${explanation.educationalExplanation}`);
            console.log('\n' + chalk_1.default.bold.red('Detailed Diagnosis'));
            console.log(`${chalk_1.default.bold('Problem:')} ${explanation.problem}`);
            console.log(`${chalk_1.default.bold('Reason:')}  ${explanation.reason}`);
            console.log('\n' + chalk_1.default.bold.green('💡 Actionable Recommendations'));
            explanation.recommendations.forEach((rec) => {
                console.log(` • ${rec}`);
            });
            console.log('\n');
        }
        catch (error) {
            console.error(chalk_1.default.red(`\n✖ Runtime Fault running diagnostics: ${error.message}`));
        }
    });
    return explain;
}
