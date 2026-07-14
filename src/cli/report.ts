import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { FiberClient } from '../rpc/fiber-client';
import { NodeDiagnostics } from '../diagnostics/node';
import { DEFAULT_RPC_URL, FIBER_RPC_URL_ENV_VAR } from '../config';

export function makeReportCommand(): Command {
  const reportCmd = new Command('report');

  reportCmd
    .description('Generate a structured Markdown diagnostic report (fiber-report.md) for logs or GitHub issues')
    .action(async () => {
      const url = process.env[FIBER_RPC_URL_ENV_VAR] || DEFAULT_RPC_URL;
      const client = new FiberClient(url);
      const diagnostics = new NodeDiagnostics(client);

      console.log(chalk.cyan('📊 Compiling infrastructure diagnostic parameters...'));

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
          if (check.problem) md += `* **Problem:** ${check.problem}\n`;
          if (check.reason) md += `* **Reasoning:** ${check.reason}\n`;
          if (check.educationalExplanation) md += `* **Protocol Context:** ${check.educationalExplanation}\n`;
          
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

        console.log(chalk.green(`\n✔ Diagnostic bundle successfully exported to local workspace!`));
        console.log(chalk.white(`Output location: ${chalk.bold(outputPath)}\n`));

      } catch (error: any) {
        console.error(chalk.red(`\n✖ Critical failure generating markdown artifact: ${error.message}`));
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
        console.error(chalk.red(`\n✖ Could not connect to node. A partial failure report has been generated at: ${outputPath}`));
      }
    });

  return reportCmd;
}