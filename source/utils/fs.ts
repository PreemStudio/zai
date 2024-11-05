import { lstatSync, readFileSync, writeFileSync } from 'fs';
import { ensureFileSync } from 'fs-extra';

export function fileExists(filePath: string) {
	try {
		lstatSync(filePath);

		return true;
	} catch {
		return false;
	}
}

export function readJsonFile(filePath: string) {
	return JSON.parse(readFileSync(filePath).toString());
}

export function writeJsonFile(filePath: string, content: object) {
	ensureFileSync(filePath);

	writeFileSync(filePath, JSON.stringify(content, null, 4));
}
