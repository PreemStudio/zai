import envPaths from 'env-paths';
import { expect, it } from 'vitest';

import { getConfigFilePath, getPaths } from '../../source/utils/env';

it('returns the correct `Paths` object', () => {
	const expectedPaths = envPaths('@basecodeoy/zai');
	const actualPaths = getPaths();

	expect(actualPaths.data).toEqual(expectedPaths.data);
	expect(actualPaths.config).toEqual(expectedPaths.config);
	expect(actualPaths.cache).toEqual(expectedPaths.cache);
	expect(actualPaths.log).toEqual(expectedPaths.log);
	expect(actualPaths.temp).toEqual(expectedPaths.temp);
});

it('returns the correct config file path', () => {
	const expectedConfigFilePath = `${getPaths().config}/config.json`;
	const actualConfigFilePath = getConfigFilePath();

	expect(actualConfigFilePath).toEqual(expectedConfigFilePath);
});
