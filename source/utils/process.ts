import { execa, ExecaReturnValue, Options } from 'execa';

export class Process {
	readonly #result: ExecaReturnValue;

	public constructor(result: ExecaReturnValue) {
		this.#result = result;
	}

	public static async run(
		file: string,
		args?: readonly string[] | undefined,
		options?: Options<string> | undefined,
	) {
		return new Process(await execa(file, args, options));
	}

	public successful() {
		return !this.#result.failed;
	}

	public failed() {
		return this.#result.failed;
	}

	public exitCode() {
		return this.#result.exitCode;
	}

	public output() {
		return this.#result.stdout;
	}

	public errorOutput() {
		return this.#result.stderr;
	}
}
