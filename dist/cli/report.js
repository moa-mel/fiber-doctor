"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeReportCommand = makeReportCommand;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const fiber_client_1 = require("../rpc/fiber-client");
const node_1 = require("../diagnostics/node");
const config_1 = require("../config");
function makeReportCommand() {
    const reportCmd = new commander_1.Command('report');
    reportCmd
        .description('Generate a structured Markdown diagnostic report (fiber-report.md) for logs or GitHub issues')
        .action(async () => {
        const url = process.env[config_1.FIBER_RPC_URL_ENV_VAR] || config_1.DEFAULT_RPC_URL;
        const client = new fiber_client_1.FiberClient(url);
        const diagnostics = new node_1.NodeDiagnostics(client);
        console.log(chalk_1.default.cyan('📊 Compiling infrastructure diagnostic parameters...'));
        try {
            const reportData = await diagnostics.runSuite();
            const timestamp = new Date().toISOString();
            let md = `# Fiber Node Diagnostic Report\n\n`;
            md += `**Generated On:** ${timestamp}  \n`;
            md += `**Target RPC Endpoint:** \`${url}\`  \n`;
            md += `**Overall Network Health Score:** ## ${reportData.score}/100\n\n`;
            md += `## System Status Checklist\n\n`;
            reportData.checks.forEach(check => {
                const statusIcon = check.status === 'pass' ? '🟩 [PASS]' : check.status === 'warn' ? '🟨 [WARN]' : '🟥 [FAIL]';
                md += `### ${statusIcon} ${check.title}\n`;
                if (check.problem)
                    md += `* **Problem:** ${check.problem}\n`;
                if (check.reason)
                    md += `* **Reasoning:** ${check.reason}\n`;
                if (check.educationalExplanation)
                    md += `* **Protocol Context:** ${check.educationalExplanation}\n`;
                if (check.recommendations && check.recommendations.length > 0) {
                    md += `* **Actionable Steps:**\n`;
                    check.recommendations.forEach(rec => {
                        md += `  - [ ] ${rec}\n`;
                    });
                }
                md += `\n---\n\n`;
            });
            md += `\n*Report compiled automatically via Fiber Doctor Diagnostics Engine.*`;
            const outputPath = path.join(process.cwd(), 'fiber-report.md');
            fs.writeFileSync(outputPath, md, 'utf-8');
            console.log(chalk_1.default.green(`\n✔ Diagnostic bundle successfully exported to local workspace!`));
            console.log(chalk_1.default.white(`Output location: ${chalk_1.default.bold(outputPath)}\n`));
        }
        catch (error) {
            console.error(chalk_1.default.red(`\n✖ Critical failure generating markdown artifact: ${error.message}`));
            // If the node is offline, generate a report indicating that.
            const timestamp = new Date().toISOString();
            let md = `# Fiber Node Diagnostic Report\n\n`;
            md += `**Generated On:** ${timestamp}  \n`;
            md += `**Target RPC Endpoint:** \`${url}\`  \n\n`;
            md += `## 🟥 [FAIL] Cannot Connect to Node\n\n`;
            md += `* **Problem:** Failed to establish a connection with the Fiber node at ${url}. The RPC endpoint is unreachable.\n`;
            md += `* **Actionable Steps:**\n  - [ ] Ensure your Fiber node process is running.\n  - [ ] Verify the RPC URL is correct and accessible.\n`;
            const outputPath = path.join(process.cwd(), 'fiber-report.md');
            fs.writeFileSync(outputPath, md, 'utf-8');
            console.error(chalk_1.default.red(`\n✖ Could not connect to node. A partial failure report has been generated at: ${outputPath}`));
        }
    });
    return reportCmd;
}
