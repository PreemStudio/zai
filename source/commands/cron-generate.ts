import { Option } from 'clipanion';
import clipboard from 'clipboardy';
import * as t from 'typanion';

import { arrayToSelection, selectFromChoices } from '../utils/openai.js';
import { requestSpinner } from '../utils/ui.js';
import { AbstractCommand } from './command.js';

export class CronGenerateCommand extends AbstractCommand {
	public static override paths = [['cron', 'generate']];

	readonly subject = Option.String('--subject', {
		description: 'The subject to generate a cron expression for',
		required: true,
		validator: t.isString(),
	});

	public async run() {
		const chatCompletion = await requestSpinner(() =>
			this.openai.createSystemCompletion(
				[
					'You are a software engineer.',
					'You will be given a text.',
					'You need to write a cron expression.',
					'Provide back only the cron expression, nothing before and nothing after.',
				],
				this.subject,
				this.config.get('openai.completions'),
			)
		);

		await clipboard.write(
			await selectFromChoices(
				arrayToSelection(chatCompletion),
				'cron expression',
			),
		);

		this.clack.log.success('The cron expression has been copied to your clipboard.');
	}
}
