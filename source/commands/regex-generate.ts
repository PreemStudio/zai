import { Option } from 'clipanion';
import clipboard from 'clipboardy';
import * as t from 'typanion';

import { arrayToSelection, selectFromChoices } from '../utils/openai.js';
import { requestSpinner } from '../utils/ui.js';
import { AbstractCommand } from './command.js';

export class RegExGenerateCommand extends AbstractCommand {
	public static override paths = [['regex', 'generate']];

	readonly subject = Option.String('--subject', {
		description: 'The subject to generate a regular expression for',
		required: true,
		validator: t.isString(),
	});

	readonly language = Option.String('--language', 'php', {
		description: 'The language to use (affects the syntax of the regular expression)',
		validator: t.isString(),
	});

	public async run() {
		const chatCompletion = await requestSpinner(() =>
			this.openai.createSystemCompletion(
				[
					'You are a software engineer.',
					'You will be given a text.',
					`You need to write a regular expression.`,
					`You will write it for the ${this.language} programming language.`,
					'Provide back only the regular expression, nothing before and nothing after.',
				],
				this.subject,
				this.config.get('openai.completions'),
			)
		);

		await clipboard.write(
			await selectFromChoices(
				arrayToSelection(chatCompletion),
				'regular expression',
			),
		);

		this.clack.log.success('The regular expression has been copied to your clipboard.');
	}
}
