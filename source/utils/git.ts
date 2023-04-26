import plur from 'plur';

import { Process } from './process.js';

const excludeFromDiff = (path: string) => `:(exclude)${path}`;

const filesToExclude = [
	'*-lock.json',
	'*-lock.yaml',
	'*.lock',
].map(excludeFromDiff);

export class Git {
	public async isWorkingTree() {
		const result = await Process.run(
			'git',
			['rev-parse', '--is-inside-work-tree'],
			{ reject: false },
		);

		return result.output() === 'true';
	}

	public async commit(message: string, stageFiles = false) {
		if (stageFiles) {
			await Process.run('git', ['add', '-A']);
		}

		return (
			await Process.run('git', [
				'commit',
				'-m',
				message.replace(/'/, `''`),
			])
		).output();
	}

	public async diff(onlyStaged = false) {
		const diffArguments = onlyStaged ? ['diff', '--cached'] : ['diff'];
		const files = (await Process.run(
			'git',
			[
				...diffArguments,
				'--name-only',
				...filesToExclude,
			],
		)).output();

		if (!files) {
			return;
		}

		return {
			files: files.split('\n'),
			diff: (
				await Process.run(
					'git',
					[
						...diffArguments,
						...filesToExclude,
					],
				)
			).output(),
		};
	}

	public async files(onlyStaged?: boolean | undefined) {
		return (
			await Process.run(
				'git',
				[
					'diff',
					onlyStaged ? '--cached' : '',
					'--name-only',
					...filesToExclude,
				],
			)
		).output().split('\n');
	}
}

export function getDetectedMessage(files: string[]) {
	return `Detected ${files.length.toLocaleString()} changed ${plur('file', files.length)}:\n${
		files.map((file) => `   - ${file}`).join('\n')
	}`;
}
