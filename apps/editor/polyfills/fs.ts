import { readdir as rdd, lstat as ls, readFile as read, stat as st } from 'fs/promises';

export function lstat(path: string) {
	return ls(path);
}

export function readdir(path: string) {
	return rdd(path);
}

export function readFile(path: string, format) {
	return read(path, format);
}

export function writeFile() {}

export function stat(path: string) {
	return st(path);
}
