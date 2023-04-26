import { Option } from 'clipanion';

import { assert } from '../utils/assert.js';
import { ApplicationError } from '../utils/errors.js';
import { getDetectedMessage } from '../utils/git.js';
import { arrayToSelection, selectFromChoices } from '../utils/openai.js';
import { assertPromptLength } from '../utils/tiktoken.js';
import { requestSpinner } from '../utils/ui.js';
import { AbstractCommand } from './command.js';

export function generateSummaryPrompt(
	style: string,
	useShortTitle: boolean,
	useSummary: boolean,
	patch?: string | undefined,
) {
	assert.string(patch);

	assertPromptLength(patch);

	const system: string[] = [
		'You are a senior software engineer.',
		'You need to summarize this git diff in a concise manner, no more than a short sentence.',
		'You need to write the summary in present tense.',
	];

	if (style === 'commit') {
		system.push('You need to phrase it like a git commit message.');
	}

	if (style === 'changelog') {
		system.push('You need to phrase it like a "Keep a Changelog" entry.');
	}

	if (style === 'conventional-commit') {
		system.push('You need to follow the Conventional Commits specification (<type>: <subject>).');
	}

	if (useShortTitle) {
		system.push('You need to include a title that should be no longer than 72 characters.');
	}

	if (useSummary) {
		system.push('You need to include a summary of all changes.');
	}

	return {
		system: [
			...system,
			'Provide back only the summary, nothing before and nothing after.',
		],
		user: patch,
	};
}

export class GitCommitCommand extends AbstractCommand {
	public static override paths = [['git', 'commit']];

	readonly style = Option.String('--style', 'conventional-commit', {
		description: 'The style of the commit message',
	});

	readonly useOnlyStaged = Option.Boolean('--use-only-staged', false, {
		description: 'Whether to summarize only staged changes',
	});

	readonly useShortTitle = Option.Boolean('--use-short-title', true, {
		description: 'Whether to include a short title (72 characters maximum)',
	});

	readonly useSummary = Option.Boolean('--use-summary', true, {
		description: 'Whether to include a summary of all changes',
	});

	public async run() {
		const detectingFiles = this.clack.spinner();
		detectingFiles.start('Detecting staged files');
		const staged = await this.git.diff(this.useOnlyStaged);

		if (!staged) {
			detectingFiles.stop('Detecting staged files');

			throw new ApplicationError(
				'No staged changes found. Make sure to stage your changes with `git add`.',
			);
		}

		detectingFiles.stop(getDetectedMessage(staged.files));

		const messages = await requestSpinner(() => {
			const { system, user } = generateSummaryPrompt(
				this.style,
				this.useShortTitle,
				this.useSummary,
				staged.diff,
			);

			return this.openai.createSystemCompletion(
				[
					...system,
					'Provide back only the summary, nothing before and nothing after.',
				],
				user,
				this.config.get('openai.completions'),
			);
		});

		if (messages.length === 0) {
			throw new ApplicationError(
				'No commit messages were generated. Try again.',
			);
		}

		await this.git.commit(
			await selectFromChoices(
				arrayToSelection(messages),
				'commit message',
			),
			true,
		);
	}
}
