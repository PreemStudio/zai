import * as clack from '@clack/prompts';
import chalk from 'chalk';
import { Command } from 'clipanion';

import { Config } from '../utils/config.js';
import { handleCliError } from '../utils/errors.js';
import { Git } from '../utils/git.js';
import { GitHub } from '../utils/github.js';
import { OpenAI } from '../utils/openai.js';
import { color, intro, outro, ui } from '../utils/ui.js';

export abstract class AbstractCommand extends Command {
	protected readonly config: Config;
	protected readonly git: Git;
	protected readonly github: GitHub;
	protected readonly openai: OpenAI;

	public constructor() {
		super();

		this.config = new Config();
		this.git = new Git();
		this.github = new GitHub(this.config.get('github.token'));
		this.openai = new OpenAI(
			this.config.get('openai.model'),
			this.config.get('openai.token'),
		);
	}

	public async execute() {
		intro();

		try {
			intro();

			await this.run();

			outro();
		} catch (error: any) {
			ui.outro(`${color.red('✖')} ${error.message}`);

			handleCliError(error);

			process.exit(1);
		}
	}

	abstract run(): Promise<void>;

	protected get clack() {
		return clack;
	}

	protected get colors() {
		return chalk;
	}
}
