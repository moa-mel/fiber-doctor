#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
require("process");
const diagnose_1 = require("./cli/diagnose");
const explain_1 = require("./cli/explain");
const report_1 = require("./cli/report");
const program = new commander_1.Command();
program
    .name('fiber-doctor')
    .description('A structural analysis diagnostic and educational CLI utility for Nervos CKB Fiber Network Node operations.')
    .version('1.0.0');
// Inject child interfaces
program.addCommand((0, diagnose_1.makeDiagnoseCommand)());
program.addCommand((0, explain_1.makeExplainCommand)());
program.addCommand((0, report_1.makeReportCommand)());
program.parse(process.argv);
