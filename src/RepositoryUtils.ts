import { InternalServerErrorException, Logger } from '@nestjs/common';

/**
 * Supabase error structure returned from failed queries
 */
export interface SupabaseError {
    code: string;
    message: string;
    details: string;
    hint: string;
}

/**
 * Common Supabase/PostgreSQL error codes
 */
export enum SupabaseErrorCode {
    /** Row not found (single row query returned no results) */
    NOT_FOUND = 'PGRST116',
    /** Unique constraint violation */
    UNIQUE_VIOLATION = '23505',
    /** Foreign key violation */
    FOREIGN_KEY_VIOLATION = '23503',
    /** Check constraint violation */
    CHECK_VIOLATION = '23514',
    /** Not null violation */
    NOT_NULL_VIOLATION = '23502',
}

/**
 * Centralized repository utilities for Supabase data access.
 * All repositories should use these methods for consistent error handling and logging.
 */
export class RepositoryUtil {
    /**
     * Log a Supabase error with structured context.
     *
     * @param logger - The NestJS Logger instance
     * @param operation - The operation name (e.g., 'findById', 'create')
     * @param context - Additional context for debugging (e.g., { id, userId })
     * @param error - The Supabase error object
     */
    static logError(
        logger: Logger,
        operation: string,
        context: unknown,
        error: SupabaseError,
    ): void {
        logger.error(`Supabase error in ${operation}:`, {
            context,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
        });
    }

    /**
     * Check if an error is a "not found" error (single row query returned no results).
     * Use this to avoid logging expected "not found" cases as errors.
     *
     * @param error - The Supabase error object
     * @returns true if the error is a "not found" error
     */
    static isNotFoundError(error: SupabaseError | null | undefined): boolean {
        return error?.code === SupabaseErrorCode.NOT_FOUND;
    }

    /**
     * Check if an error is a unique constraint violation.
     * Use this to handle duplicate key scenarios gracefully.
     *
     * @param error - The Supabase error object
     * @returns true if the error is a unique constraint violation
     */
    static isUniqueViolation(error: SupabaseError | null | undefined): boolean {
        return error?.code === SupabaseErrorCode.UNIQUE_VIOLATION;
    }

    /**
     * Check if an error is a foreign key violation.
     *
     * @param error - The Supabase error object
     * @returns true if the error is a foreign key violation
     */
    static isForeignKeyViolation(error: SupabaseError | null | undefined): boolean {
        return error?.code === SupabaseErrorCode.FOREIGN_KEY_VIOLATION;
    }

    /**
     * Log an error only if it's not an expected "not found" error.
     * Common pattern for findById, findByX type queries.
     *
     * @param logger - The NestJS Logger instance
     * @param operation - The operation name
     * @param context - Additional context for debugging
     * @param error - The Supabase error object
     */
    static logErrorIfNotExpected(
        logger: Logger,
        operation: string,
        context: unknown,
        error: SupabaseError,
    ): void {
        if (!this.isNotFoundError(error)) {
            this.logError(logger, operation, context, error);
        }
    }

    /**
     * Handle a Supabase single-record query result.
     * Returns null and logs if the query fails (for optional lookups).
     *
     * @param logger - The NestJS Logger instance
     * @param operation - The operation name
     * @param context - Additional context for debugging
     * @param result - The Supabase query result
     * @returns The data or null
     */
    static handleSingleResult<T>(
        logger: Logger,
        operation: string,
        context: unknown,
        result: { data: T | null; error: unknown },
    ): T | null {
        if (result.error) {
            this.logErrorIfNotExpected(logger, operation, context, result.error as SupabaseError);
            return null;
        }
        return result.data;
    }

    /**
     * Handle a Supabase list query result.
     * Returns empty array and logs if the query fails.
     *
     * @param logger - The NestJS Logger instance
     * @param operation - The operation name
     * @param context - Additional context for debugging
     * @param result - The Supabase query result
     * @returns The data array or empty array
     */
    static handleListResult<T>(
        logger: Logger,
        operation: string,
        context: unknown,
        result: { data: T[] | null; error: unknown },
    ): T[] {
        if (result.error) {
            this.logError(logger, operation, context, result.error as SupabaseError);
            return [];
        }
        return result.data ?? [];
    }

    /**
     * Handle a Supabase mutation result that must succeed.
     * Throws InternalServerErrorException on failure.
     *
     * @param logger - The NestJS Logger instance
     * @param operation - The operation name
     * @param context - Additional context for debugging
     * @param result - The Supabase query result
     * @param errorMessage - The error message for the exception
     * @returns The data (non-null)
     */
    static handleRequiredResult<T>(
        logger: Logger,
        operation: string,
        context: unknown,
        result: { data: T | null; error: unknown },
        errorMessage: string,
    ): T {
        if (result.error) {
            this.logError(logger, operation, context, result.error as SupabaseError);
            throw new InternalServerErrorException(errorMessage);
        }
        if (result.data === null || result.data === undefined) {
            logger.error(`Expected non-null result in ${operation} but got null`, { context });
            throw new InternalServerErrorException(errorMessage);
        }
        return result.data;
    }
}
