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
	prefixes?: string | undefined,
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

	if (prefixes !== undefined) {
		system.push(`You need to use one of the following prefixes: ${prefixes}`);
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

	readonly style = Option.String('--style', 'commit', {
		description: 'The style of the commit message',
	});

	readonly prefix = Option.String('--prefix', {
		description: 'Whether to include the given prefix in the commit message',
	});

	readonly prefixes = Option.String('--prefixes', {
		description: 'Whether to include a prefix from the given list in the commit message',
	});

	readonly usePrefixPrompt = Option.String('--use-prefix-prompt', {
		description: 'Whether to prompt for a prefix from the given list',
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

	readonly push = Option.Boolean('--push', true, {
		description: 'Whether to push the commit to the remote repository',
	});

	public async run() {
		let prefix = this.prefix;

		if (prefix === undefined && this.prefixes !== undefined && this.usePrefixPrompt) {
			const selection = await this.clack.select({
				message: 'Which prefix do you want to use?',
				options: this.prefixes.split(',').map((prefix) => ({
					label: prefix,
					value: prefix,
				})),
			});

			if (typeof selection === 'string') {
				prefix = selection;
			}
		}

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
				this.prefixes,
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

		const commitMessageSelection = await selectFromChoices(
			arrayToSelection(messages),
			'commit message',
		);

		await this.git.commit(
			prefix === undefined ? commitMessageSelection : `${prefix}: ${commitMessageSelection}`,
			true,
		);

		if (this.push) {
			await this.git.push();
		}
	}
}
