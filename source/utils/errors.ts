import chalk from 'chalk';

const APPLICATION_VERSION = '1.0.0';

export class ApplicationError extends Error {}

const indent = '    ';

export function handleCliError(error: any) {
	if (error instanceof Error && !(error instanceof ApplicationError)) {
		if (error.stack) {
			console.error(
				chalk.dim(error.stack.split('\n').slice(1).join('\n')),
			);
		}

		console.error(`\n${indent}${chalk.dim(`zai v${APPLICATION_VERSION}`)}`);
		console.error(
			`\n${indent}Please open a Bug report with the information above:`,
		);
		console.error(
			`${indent}https://github.com/faustbrian/zai/issues/new/choose`,
		);
	}
}
