#!/usr/bin/env node
import { Command } from 'commander';
import 'process';
import { makeDiagnoseCommand } from './cli/diagnose';
import { makeExplainCommand } from './cli/explain';
import { makeReportCommand } from './cli/report';

const program = new Command();

program
  .name('fiber-doctor')
  .description('A structural analysis diagnostic and educational CLI utility for Nervos CKB Fiber Network Node operations.')
  .version('1.0.0');

// Inject child interfaces
program.addCommand(makeDiagnoseCommand());
program.addCommand(makeExplainCommand());
program.addCommand(makeReportCommand());

program.parse(process.argv);