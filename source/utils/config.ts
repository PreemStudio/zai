import { deleteProperty, getProperty, hasProperty, setProperty } from 'dot-prop';
import { z } from 'zod';

import { getConfigFilePath } from './env.js';
import { fileExists, readJsonFile, writeJsonFile } from './fs.js';

const ConfigSchema = z.object({
	locale: z.string(),
	github: z.object({
		token: z.string(),
	}),
	openai: z.object({
		token: z.string().startsWith('sk-'),
		model: z.string(),
		completions: z.number().min(1).max(5),
	}),
});

type ConfigType = z.infer<typeof ConfigSchema>;

export class Config {
	#config: ConfigType;

	public constructor() {
		const filePath = getConfigFilePath();

		if (!fileExists(filePath)) {
			throw new Error(`Config file not found at ${filePath}`);
		}

		this.#config = this.#validate(readJsonFile(filePath));
	}

	public get<T>(key: string): T {
		const result = getProperty(this.#config, key);

		if (result === undefined) {
			throw new Error(`Config key "${key}" not found`);
		}

		return result;
	}

	public has(key: string) {
		return hasProperty(this.#config, key);
	}

	public delete(key: string): void {
		deleteProperty(this.#config, key);

		this.#persist();
	}

	public set(key: string, value: string): void {
		setProperty(this.#config, key, value);

		this.#persist();
	}

	public fill(value: ConfigType): void {
		this.#config = value;

		this.#persist();
	}

	#persist() {
		this.#validate(this.#config);

		writeJsonFile(getConfigFilePath(), this.#config);
	}

	#validate(data: unknown) {
		return ConfigSchema.parse(data);
	}
}
