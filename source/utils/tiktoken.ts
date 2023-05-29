import { encoding_for_model, TiktokenModel } from '@dqbd/tiktoken';

const encoding = encoding_for_model('gpt-4');

export function getEncoding(model: TiktokenModel) {
	return encoding_for_model(model);
}

export function getPromptLength(prompt: string) {
	return encoding.encode(prompt);
}

export function assertPromptLength(prompt?: string | undefined) {
	if (prompt === undefined) {
		throw new Error('The prompt cannot be undefined.');
	}

	if (encoding.encode(prompt).length > 4000) {
		throw new Error('The prompt is too large for the OpenAI API.');
	}
}
