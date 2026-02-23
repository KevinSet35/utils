/**
 * Comparison utilities for deep equality checks on arrays and objects.
 * Used across prompt-library and prompt-versions modules.
 */
export class ComparisonUtil {
    /**
     * Compare two string arrays for equality, ignoring order.
     *
     * @param a - First array
     * @param b - Second array
     * @returns true if both arrays contain the same elements
     */
    static sortedArraysEqual(a: string[], b: string[]): boolean {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((val, index) => val === sortedB[index]);
    }

    /**
     * Order-insensitive deep equality for JSON-serializable objects.
     * Handles nested objects and arrays. Safe across different serialization sources.
     */
    static deepEqual(
        a: Record<string, unknown> | null | undefined,
        b: Record<string, unknown> | null | undefined,
    ): boolean {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return JSON.stringify(ComparisonUtil.sortKeys(a)) === JSON.stringify(ComparisonUtil.sortKeys(b));
    }

    /**
    * Recursively sort all keys in an object for consistent JSON.stringify output.
    */
    private static sortKeys(obj: unknown): unknown {
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => ComparisonUtil.sortKeys(item));
        }
        const sorted: Record<string, unknown> = {};
        for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
            sorted[key] = ComparisonUtil.sortKeys((obj as Record<string, unknown>)[key]);
        }
        return sorted;
    }
}
