import { Option } from 'clipanion';
import * as t from 'typanion';

import { getConfigFilePath } from '../utils/env.js';
import { AbstractCommand } from './command.js';

export class ConfigInitializeCommand extends AbstractCommand {
	public static override paths = [['config', 'init']];

	readonly githubToken = Option.String('--github-token', {
		description: 'The GitHub token to use',
		required: true,
		validator: t.isString(),
	});

	readonly openaiToken = Option.String('--openai-token', {
		description: 'The OpenAI token to use',
		required: true,
		validator: t.isString(),
	});

	public async run() {
		this.config.fill({
			locale: 'en-US',
			github: { token: this.githubToken },
			openai: {
				token: this.openaiToken,
				model: 'gpt-3.5-turbo',
				completions: 5,
			},
		});

		this.clack.log.success(`Wrote configuration to ${getConfigFilePath()}`);
	}
}
