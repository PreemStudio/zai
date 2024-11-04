import { Option } from 'clipanion';
import * as t from 'typanion';

import { getConfigFilePath } from '../utils/env.js';
import { AbstractCommand } from './command.js';

export class ConfigUnsetCommand extends AbstractCommand {
	public static override paths = [['config', 'unset']];

	readonly key = Option.String('--key', {
		description: 'The key to unset the value for',
		required: true,
		validator: t.isString(),
	});

	public async run() {
		this.config.delete(this.key);

		this.clack.log.success(`Wrote configuration to ${getConfigFilePath()}`);
	}
}
