import { Option } from 'clipanion';
import clipboard from 'clipboardy';
import { readFileSync } from 'fs';
import * as t from 'typanion';

import { arrayToSelection, selectFromChoices } from '../utils/openai.js';
import { requestSpinner } from '../utils/ui.js';
import { AbstractCommand } from './command.js';

export class TestGenerateCommand extends AbstractCommand {
	public static override paths = [['test', 'generate']];

	readonly file = Option.String('--file', {
		description: 'The file to generate tests for',
		required: true,
		validator: t.isString(),
	});

	readonly type = Option.String('--type', 'unit', {
		description: 'The test type to generate (unit, integration, etc.)',
		validator: t.isString(),
	});

	readonly language = Option.String('--language', 'php', {
		description: 'The testing framework to use (php, typescript, etc)',
		validator: t.isString(),
	});

	readonly framework = Option.String('--framework', 'pest', {
		description: 'The testing framework to use (pest, vitest, etc)',
		validator: t.isString(),
	});

	readonly syntax = Option.String('--syntax', 'it', {
		description: 'The syntax to use (it, test, etc)',
		validator: t.isString(),
	});

	public async run() {
		const chatCompletion = await requestSpinner(() =>
			this.openai.createSystemCompletion(
				[
					'You are a software test engineer.',
					`You will be given ${this.language} code.`,
					`You need to write ${this.framework} tests.`,
					`You will be using the ${this.framework} framework with the ${this.syntax} syntax.`,
					'Provide back only the test code, nothing before and nothing after.',
				],
				readFileSync(this.file).toString(),
				this.config.get('openai.completions'),
			)
		);

		await clipboard.write(
			await selectFromChoices(
				arrayToSelection(chatCompletion),
				`${this.type} test`,
			),
		);

		this.clack.log.success('The unit test has been copied to your clipboard.');
	}
}
