import { note } from '@clack/prompts';
import {
	ChatCompletionRequestMessage,
	Configuration,
	CreateChatCompletionResponseChoicesInner,
	OpenAIApi,
} from 'openai';

import { ApplicationError } from './errors.js';
import { color, selectFrom, ui } from './ui.js';

export async function selectFromChoices(
	choices: { label: string; value: string }[],
	entity: string,
) {
	let choice;

	if (choices.length === 1) {
		choice = choices[0]?.value;

		if (!choice) {
			ui.outro('Operation cancelled.');

			process.exit(0);
		}

		note(choice);

		const confirmed = await ui.confirm({
			message: `Use this ${entity}?`,
		});

		if (!confirmed || ui.isCancel(confirmed)) {
			ui.outro('Operation cancelled.');

			process.exit(0);
		}
	} else {
		choice = await selectFrom(
			`Which ${entity} do you want to proceed with? ${color.dim('(Ctrl+c to exit)')}`,
			choices,
		);
	}

	if (ui.isCancel(choice)) {
		ui.outro('Operation cancelled.');

		process.exit(0);
	}

	return choice;
}

export function choicesToSelection(
	choices: CreateChatCompletionResponseChoicesInner[],
) {
	return choices.map(({ message }) => {
		if (message === undefined) {
			throw new Error('Message is undefined in choice.');
		}

		return { value: message.content, label: message.content };
	});
}

export function arrayToSelection(
	choices: string[],
) {
	return choices.map((choice) => {
		if (choice === undefined) {
			throw new Error('Message is undefined in choice.');
		}

		return { value: choice, label: choice };
	});
}

export class OpenAI {
	readonly #client: OpenAIApi;
	readonly #model: string;

	public constructor(
		model: string,
		apiKey?: string | undefined,
	) {
		this.#client = new OpenAIApi(
			new Configuration({ apiKey }),
		);
		this.#model = model;

		this.#client;
	}

	public async createSystemCompletion(
		system: string[],
		user: string,
		completions: number,
	): Promise<string[]> {
		return this.#createChatCompletion([
			{
				role: 'system',
				content: system.join(' '),
			},
			{
				role: 'user',
				content: user,
			},
		], completions);
	}

	public async createChatCompletion(
		user: string,
		completions: number,
	): Promise<string[]> {
		return this.#createChatCompletion([
			{
				role: 'user',
				content: user,
			},
		], completions);
	}

	async #createChatCompletion(
		messages: ChatCompletionRequestMessage[],
		completions: number,
	): Promise<string[]> {
		const { data, status: statusCode, statusText } = await this.#client
			.createChatCompletion({
				model: this.#model,
				messages,
				temperature: 0.7,
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0,
				// 200 only for commits
				// max_tokens: 200,
				stream: false,
				n: completions,
			});

		if (
			!statusCode
			|| statusCode < 200
			|| statusCode > 299
		) {
			let errorMessage = `OpenAI API Error: ${statusCode} - ${statusText}`;

			if (data) {
				errorMessage += `\n\n${data}`;
			}

			if (statusCode === 500) {
				errorMessage += '\n\nCheck the API status: https://status.openai.com';
			}

			throw new ApplicationError(errorMessage);
		}

		return this.#deduplicateMessages(
			data.choices
				.filter((choice) => choice.message?.content)
				.map((choice) => this.#sanitizeMessage(choice.message!.content)),
		);
	}

	#sanitizeMessage(message: string) {
		return message.trim();
	}

	#deduplicateMessages(array: string[]) {
		return Array.from(new Set(array));
	}
}
