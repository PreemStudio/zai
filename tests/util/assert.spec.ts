import { expect, it } from 'vitest';

import { assert } from '../../source/utils/assert';

it('should validate boolean', () => {
	assert.boolean(true);
	assert.boolean(false);
	expect(() => assert.boolean(null)).toThrow();
	expect(() => assert.boolean(1)).toThrow();
	expect(() => assert.boolean('true')).toThrow();
});

it('should validate buffer', () => {
	const buffer = Buffer.from('test', 'utf8');
	assert.buffer(buffer);
	expect(() => assert.buffer(null)).toThrow();
	expect(() => assert.buffer('test')).toThrow();
});

it('should validate bytes', () => {
	const bytes = new Uint8Array([0, 1, 2, 3]);
	assert.bytes(bytes);
	expect(() => assert.bytes(null)).toThrow();
	expect(() => assert.bytes([0, 1, 2, 3])).toThrow();
});

it('should validate number', () => {
	assert.number(0);
	assert.number(1.5);
	expect(() => assert.number(null)).toThrow();
	expect(() => assert.number('0')).toThrow();
});

it('should validate object', () => {
	assert.object({});
	assert.object({ key: 'value' });
	expect(() => assert.object('hello')).toThrow();
	expect(() => assert.object(0)).toThrow();
});

it('should validate string', () => {
	assert.string('');
	assert.string('test');
	expect(() => assert.string(null)).toThrow();
	expect(() => assert.string(0)).toThrow();
});

it('should validate symbol', () => {
	const symbol = Symbol();
	assert.symbol(symbol);
	expect(() => assert.symbol(null)).toThrow();
	expect(() => assert.symbol('symbol')).toThrow();
});

it('should validate undefined', () => {
	assert.undefined(undefined);
	expect(() => assert.undefined(null)).toThrow();
	expect(() => assert.undefined('undefined')).toThrow();
});

it('should validate array', () => {
	assert.array([]);
	assert.array([0, 1, 2]);
	expect(() => assert.array(null)).toThrow();
	expect(() => assert.array({ 0: 'a', 1: 'b' })).toThrow();
});

it('should validate bigint', () => {
	assert.bigint(BigInt(1));
	expect(() => assert.bigint(null)).toThrow();
	expect(() => assert.bigint(1)).toThrow();
});

it('should validate defined', () => {
	assert.defined('');
	assert.defined(0);
	assert.defined(false);
	expect(() => assert.defined(null)).toThrow();
	expect(() => assert.defined(undefined)).toThrow();
});
