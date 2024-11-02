import { Option } from 'clipanion';
import * as t from 'typanion';

import { getConfigFilePath } from '../utils/env.js';
import { AbstractCommand } from './command.js';

export class ConfigSetCommand extends AbstractCommand {
	public static override paths = [['config', 'set']];

	readonly key = Option.String('--key', {
		description: 'The key to set the value for',
		required: true,
		validator: t.isString(),
	});

	readonly value = Option.String('--value', {
		description: 'The value to set the key to',
		required: true,
		validator: t.isString(),
	});

	public async run() {
		this.config.set(this.key, this.value);

		this.clack.log.success(`Wrote configuration to ${getConfigFilePath()}`);
	}
}
