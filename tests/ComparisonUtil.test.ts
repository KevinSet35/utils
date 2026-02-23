import { describe, it, expect } from 'vitest';
import { ComparisonUtil } from '../src/ComparisonUtil.js';

describe('ComparisonUtil', () => {
    describe('sortedArraysEqual', () => {
        it('returns true for identical arrays', () => {
            expect(ComparisonUtil.sortedArraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
        });

        it('returns true for same elements in different order', () => {
            expect(ComparisonUtil.sortedArraysEqual(['c', 'a', 'b'], ['b', 'c', 'a'])).toBe(true);
        });

        it('returns false for different lengths', () => {
            expect(ComparisonUtil.sortedArraysEqual(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
        });

        it('returns false for different elements', () => {
            expect(ComparisonUtil.sortedArraysEqual(['a', 'b', 'c'], ['a', 'b', 'd'])).toBe(false);
        });

        it('returns true for two empty arrays', () => {
            expect(ComparisonUtil.sortedArraysEqual([], [])).toBe(true);
        });

        it('returns false when one array is empty', () => {
            expect(ComparisonUtil.sortedArraysEqual([], ['a'])).toBe(false);
        });

        it('does not mutate the input arrays', () => {
            const a = ['c', 'a', 'b'];
            const b = ['b', 'c', 'a'];
            ComparisonUtil.sortedArraysEqual(a, b);
            expect(a).toEqual(['c', 'a', 'b']);
            expect(b).toEqual(['b', 'c', 'a']);
        });

        it('handles duplicate elements', () => {
            expect(ComparisonUtil.sortedArraysEqual(['a', 'a', 'b'], ['a', 'b', 'a'])).toBe(true);
            expect(ComparisonUtil.sortedArraysEqual(['a', 'a', 'b'], ['a', 'b', 'b'])).toBe(false);
        });
    });

    describe('deepEqual', () => {
        it('returns true for identical objects', () => {
            expect(ComparisonUtil.deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
        });

        it('returns true for objects with same keys in different order', () => {
            expect(ComparisonUtil.deepEqual({ b: 2, a: 1 }, { a: 1, b: 2 })).toBe(true);
        });

        it('returns false for objects with different values', () => {
            expect(ComparisonUtil.deepEqual({ a: 1 }, { a: 2 })).toBe(false);
        });

        it('returns false for objects with different keys', () => {
            expect(ComparisonUtil.deepEqual({ a: 1 }, { b: 1 })).toBe(false);
        });

        it('returns true when both are null', () => {
            expect(ComparisonUtil.deepEqual(null, null)).toBe(true);
        });

        it('returns true when both are undefined', () => {
            expect(ComparisonUtil.deepEqual(undefined, undefined)).toBe(true);
        });

        it('returns true for null and undefined', () => {
            expect(ComparisonUtil.deepEqual(null, undefined)).toBe(true);
        });

        it('returns false when one is null and the other is an object', () => {
            expect(ComparisonUtil.deepEqual(null, { a: 1 })).toBe(false);
            expect(ComparisonUtil.deepEqual({ a: 1 }, null)).toBe(false);
        });

        it('returns false when one is undefined and the other is an object', () => {
            expect(ComparisonUtil.deepEqual(undefined, { a: 1 })).toBe(false);
            expect(ComparisonUtil.deepEqual({ a: 1 }, undefined)).toBe(false);
        });

        it('handles nested objects with different key order', () => {
            const a = { x: { b: 2, a: 1 }, y: 3 };
            const b = { y: 3, x: { a: 1, b: 2 } };
            expect(ComparisonUtil.deepEqual(a, b)).toBe(true);
        });

        it('handles deeply nested structures', () => {
            const a = { level1: { level2: { level3: { value: 'deep' } } } };
            const b = { level1: { level2: { level3: { value: 'deep' } } } };
            expect(ComparisonUtil.deepEqual(a, b)).toBe(true);
        });

        it('handles arrays within objects', () => {
            const a = { items: [1, 2, 3] };
            const b = { items: [1, 2, 3] };
            expect(ComparisonUtil.deepEqual(a, b)).toBe(true);
        });

        it('detects different arrays within objects', () => {
            const a = { items: [1, 2, 3] };
            const b = { items: [1, 2, 4] };
            expect(ComparisonUtil.deepEqual(a, b)).toBe(false);
        });

        it('detects different array order within objects', () => {
            const a = { items: [1, 2, 3] };
            const b = { items: [3, 2, 1] };
            expect(ComparisonUtil.deepEqual(a, b)).toBe(false);
        });

        it('handles empty objects', () => {
            expect(ComparisonUtil.deepEqual({}, {})).toBe(true);
        });

        it('handles objects with boolean and null values', () => {
            const a = { flag: true, nothing: null };
            const b = { nothing: null, flag: true };
            expect(ComparisonUtil.deepEqual(a, b)).toBe(true);
        });

        it('handles mixed nested objects and arrays', () => {
            const a = { list: [{ b: 2, a: 1 }, { d: 4, c: 3 }] };
            const b = { list: [{ a: 1, b: 2 }, { c: 3, d: 4 }] };
            expect(ComparisonUtil.deepEqual(a, b)).toBe(true);
        });
    });
});
