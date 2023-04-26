import envPaths, { Paths } from 'env-paths';

export function getPaths(): Paths {
	return envPaths('@bombenprodukt/zai');
}

export function getConfigFilePath(): string {
	return `${getPaths().config}/config.json`;
}
