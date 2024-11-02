import { Option } from 'clipanion';
import * as t from 'typanion';

import { assert } from '../utils/assert.js';
import { AbstractCommand } from './command.js';
import { generateSummaryPrompt } from './git-commit.js';

export class GitSummarizePullRequestCommand extends AbstractCommand {
	public static override paths = [['git', 'summarize', 'pr']];

	readonly repo = Option.String('--repo', {
		description: 'The repository to search for pull requests',
		required: true,
		validator: t.isString(),
	});

	readonly number = Option.String('--number', {
		description: 'The pull request number',
		validator: t.isNumber(),
	});

	readonly state = Option.String('--state', 'open', {
		description: 'The pull request state',
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
		const pullRequest = await this.#getPullRequest();

		assert.defined(pullRequest.merge_commit_sha);

		const { files } = await this.github.findCommitByHash(
			this.repo,
			pullRequest.merge_commit_sha,
		);

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

	async #getPullRequest() {
		if (typeof this.number === 'number') {
			return this.github.findPullRequestByNumber(this.repo, this.number);
		}

		const pullRequests = await this.github.listPullRequests(
			this.repo,
			this.state as any,
		);

		return this.github.findPullRequestByNumber(
			this.repo,
			parseInt(
				(await this.clack.select({
					message: 'Which pull request do you want to summarize?',
					options: pullRequests.map((pullRequest) => ({
						label: pullRequest.title,
						value: `${pullRequest.number}`,
					})),
				})) as string,
			),
		);
	}
}
