import { Option } from 'clipanion';
import * as t from 'typanion';

import { assert } from '../utils/assert.js';
import { requestSpinner } from '../utils/ui.js';
import { AbstractCommand } from './command.js';
import { generateSummaryPrompt } from './git-commit.js';

export class GitSummarizeCommitCommand extends AbstractCommand {
	public static override paths = [['git', 'summarize', 'commit']];

	readonly repo = Option.String('--repo', {
		description: 'The repository to search for commits',
		required: true,
		validator: t.isString(),
	});

	readonly sha = Option.String('--sha', {
		description: 'The commit SHA to summarize',
		validator: t.isString(),
	});

	readonly branch = Option.String('--branch', 'main', {
		description: 'The branch to summarize',
		validator: t.isString(),
	});

	readonly base = Option.String('--base', {
		description: 'The base of the commit history',
		validator: t.isString(),
	});

	readonly head = Option.String('--head', {
		description: 'The head of the commit history',
		validator: t.isString(),
	});

	readonly style = Option.String('--style', 'changelog', {
		description: 'The style of the summary',
		validator: t.isString(),
	});

	readonly useShortTitle = Option.Boolean('--use-short-title', true, {
		description: 'Whether to include a short title (72 characters maximum)',
	});

	readonly useSummary = Option.Boolean('--use-summary', true, {
		description: 'Whether to include a summary of all changes',
	});

	public async run() {
		if (!(await this.git.isWorkingTree())) {
			this.clack.log.error(
				'The current directory must be a Git repository!',
			);

			return;
		}

		const files = await requestSpinner(() => this.#getCommitFiles());

		if (!Array.isArray(files)) {
			this.clack.log.error('No files found in commit.');

			return;
		}

		const summaries = [];

		for (const file of files) {
			const { system, user } = generateSummaryPrompt(
				this.style,
				this.useShortTitle,
				this.useSummary,
				file.patch,
			);

			summaries.push(
				(
					await this.openai.createSystemCompletion(
						system,
						user,
						this.config.get('openai.completions'),
					)
				)[0],
			);
		}

		this.clack.note(
			summaries.map((summary) => `- ${summary}`).join('\n'),
		);
	}

	async #getCommitFiles() {
		if (this.sha !== undefined) {
			return (
				await this.github.findCommitByHash(this.repo, this.sha)
			).files;
		}

		if (this.base && this.head) {
			return (
				await this.github.compareCommits(
					this.repo,
					this.base,
					this.head,
				)
			).files;
		}

		const commits = await this.github.listCommits(this.repo, this.branch);

		const sha = await this.clack.select({
			message: 'Which commit do you want to summarize?',
			options: commits.map((commit) => ({
				label: commit.commit.message,
				value: commit.sha,
			})),
		});

		assert.string(sha);

		return (await this.github.findCommitByHash(this.repo, sha)).files;
	}
}
