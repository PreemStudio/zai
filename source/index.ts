#!/usr/bin/env node
import './utils/env.js';

import { Cli } from 'clipanion';

import { ConfigGetCommand } from './commands/config-get.js';
import { ConfigInitializeCommand } from './commands/config-init.js';
import { ConfigSetCommand } from './commands/config-set.js';
import { ConfigUnsetCommand } from './commands/config-unset.js';
import { CronGenerateCommand } from './commands/cron-generate.js';
import { GitCommitCommand } from './commands/git-commit.js';
import { GitSummarizeCommitCommand } from './commands/git-summarize-commit.js';
import { GitSummarizePullRequestCommand } from './commands/git-summarize-pull-request.js';
import { RegExGenerateCommand } from './commands/regex-generate.js';
import { TestGenerateCommand } from './commands/test-generate.js';

const [node, app, ...args] = process.argv;

const cli = new Cli({
	binaryLabel: `zai`,
	binaryName: `${node} ${app}`,
	binaryVersion: `1.0.0`,
});

cli.register(ConfigGetCommand);
cli.register(ConfigInitializeCommand);
cli.register(ConfigSetCommand);
cli.register(ConfigUnsetCommand);
cli.register(CronGenerateCommand);
cli.register(GitCommitCommand);
cli.register(GitSummarizeCommitCommand);
cli.register(GitSummarizePullRequestCommand);
cli.register(RegExGenerateCommand);
cli.register(TestGenerateCommand);
cli.runExit(args);
