import { Octokit } from 'octokit';

import { assert } from './assert.js';

export class GitHub {
	readonly #client: Octokit;

	public constructor(auth?: string | undefined) {
		this.#client = new Octokit(auth ? { auth } : {});
	}

	public async compareCommits(repo: string, base: string, head: string) {
		return (
			await this.#client.rest.repos
				.compareCommits({
					owner: this.#getUser(repo),
					repo: this.#getRepo(repo),
					base,
					head,
				})
		).data;
	}

	public async listCommits(repo: string, sha: string) {
		return (
			await this.#client.rest.repos
				.listCommits({
					owner: this.#getUser(repo),
					repo: this.#getRepo(repo),
					sha,
				})
		).data;
	}

	public async findCommitByHash(repo: string, sha: string) {
		return (
			await this.#client.rest.repos
				.getCommit({
					owner: this.#getUser(repo),
					repo: this.#getRepo(repo),
					ref: sha,
				})
		).data;
	}

	public async listPullRequests(
		repo: string,
		state?: 'open' | 'closed' | 'all' | undefined,
	) {
		return (
			await this.#client.rest.pulls.list({
				owner: this.#getUser(repo),
				repo: this.#getRepo(repo),
				state,
			})
		).data;
	}

	public async findPullRequestByNumber(repo: string, number: number) {
		return (
			await this.#client.rest.pulls.get(
				{
					owner: this.#getUser(repo),
					repo: this.#getRepo(repo),
					pull_number: number,
				},
			)
		).data;
	}

	#getUser(repo: string) {
		const result = repo.split('/')[0];

		assert.defined(result);

		return result;
	}

	#getRepo(repo: string) {
		const result = repo.split('/')[1];

		assert.defined(result);

		return result;
	}
}
