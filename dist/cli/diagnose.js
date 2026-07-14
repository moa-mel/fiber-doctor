"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDiagnoseCommand = makeDiagnoseCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
require("process");
const fiber_client_1 = require("../rpc/fiber-client");
const node_1 = require("../diagnostics/node");
const channels_1 = require("../diagnostics/channels");
const config_1 = require("../config");
function makeDiagnoseCommand() {
    const command = new commander_1.Command('diagnose');
    command
        .description('Execute a real-time status and health scan of the running Fiber node architecture')
        .action(async () => {
        const url = process.env[config_1.FIBER_RPC_URL_ENV_VAR] || config_1.DEFAULT_RPC_URL;
        const client = new fiber_client_1.FiberClient(url);
        const diagnostics = new node_1.NodeDiagnostics(client);
        const channelDiag = new channels_1.ChannelDiagnostics(client);
        console.log(chalk_1.default.cyan(`⚡ Running Suite on Core Node Protocol Endpoint: ${url}\n`));
        const report = await diagnostics.runSuite();
        const channelMetrics = await channelDiag.getMetrics();
        console.log(chalk_1.default.bold('--- Node Health Report ---'));
        const isOnline = report.checks.some(c => c.id === 'NODE_ONLINE');
        console.log(`Node Status:  ${isOnline ? chalk_1.default.green('✔ Running') : chalk_1.default.red('✖ Offline')}`);
        const openChannelsColor = channelMetrics.open > 0 ? chalk_1.default.green : chalk_1.default.yellow;
        console.log(`Channels:     ${openChannelsColor(`${channelMetrics.open} open`)}, ${channelMetrics.pending} pending`);
        const failedChecks = report.checks.filter(c => c.status === 'fail' || c.status === 'warn');
        console.log(`Alerts Flagged: ${failedChecks.length === 0 ? chalk_1.default.green('None') : chalk_1.default.yellow(failedChecks.length)}`);
        // Health score display
        let scoreColor = chalk_1.default.green;
        if (report.score < 80)
            scoreColor = chalk_1.default.yellow;
        if (report.score < 50)
            scoreColor = chalk_1.default.red;
        console.log(`Health Score: ${scoreColor(`${report.score}/100`)}\n`);
        if (failedChecks.length > 0) {
            console.log(chalk_1.default.bold.yellow('Action Summary Required:'));
            failedChecks.forEach(c => {
                const sym = c.status === 'fail' ? chalk_1.default.red('✖') : chalk_1.default.yellow('⚠');
                console.log(`  ${sym} [${c.component.toUpperCase()}] ${c.title}`);
                if (c.problem)
                    console.log(chalk_1.default.dim(`     Context: ${c.problem}`));
            });
            console.log('');
        }
        else {
            console.log(chalk_1.default.green('✔ All evaluated runtime primitives conform to networking specifications!\n'));
        }
    });
    return command;
}
