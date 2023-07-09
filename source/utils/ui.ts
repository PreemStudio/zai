import * as p from "@clack/prompts";
import chalk from "chalk";

export async function group<T>(prompts: p.PromptGroup<T>) {
	return p.group(prompts, {
		onCancel: () => {
			p.cancel("Operation cancelled.");
			process.exit(0);
		},
	});
}

export async function selectFrom(
	message: string,
	options: {
		label: string;
		value: string;
	}[]
) {
	return (await p.select({ message, options })) as string;
}

export async function spinner<T>(
	start: string,
	callback: () => Promise<T>,
	stop: string
) {
	const s = p.spinner();

	s.start(start);

	const result = await callback();

	s.stop(stop);

	return result;
}

export function intro() {
	console.clear();

	p.intro(`${chalk.bgCyan(chalk.black(" zai "))}`);
}

export function outro() {
	p.outro(
		`Problems? ${chalk.underline(
			chalk.cyan("https://github.com/faustbrian/zai/issues")
		)}`
	);
}

export function isCancel(value: unknown) {
	if (p.isCancel(value)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}
}

export async function requestSpinner<T>(callback: () => Promise<T>) {
	const s = p.spinner();

	s.start("AI is processing your request");

	const result = await callback();

	s.stop("Request processed");

	return result;
}

export const ui = p;
export const color = chalk;
