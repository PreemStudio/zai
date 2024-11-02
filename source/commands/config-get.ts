import { Option } from 'clipanion';
import * as t from 'typanion';

import { AbstractCommand } from './command.js';

export class ConfigGetCommand extends AbstractCommand {
	public static override paths = [['config', 'get']];

	readonly key = Option.String('--key', {
		description: 'The key to get the value for',
		required: true,
		validator: t.isString(),
	});

	public async run() {
		this.clack.note(this.config.get(this.key));
	}
}
