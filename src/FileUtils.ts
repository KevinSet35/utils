/**
 * Supported file MIME types for LLM providers
 */
export enum FileType {
    // Images
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_PNG = 'image/png',
    IMAGE_GIF = 'image/gif',
    IMAGE_WEBP = 'image/webp',
    // Documents
    PDF = 'application/pdf',
    // Text
    TEXT_PLAIN = 'text/plain',
    TEXT_CSV = 'text/csv',
    TEXT_HTML = 'text/html',
    TEXT_MARKDOWN = 'text/markdown',
}

/**
 * File content categories for LLM processing
 */
export enum FileContentCategory {
    IMAGE = 'image',
    DOCUMENT = 'document',
    TEXT = 'text',
}

// ============================================================================
// File Type Groups (exported for reuse across providers)
// ============================================================================

/** Image file types supported by LLM providers */
export const IMAGE_FILE_TYPES: FileType[] = [
    FileType.IMAGE_JPEG,
    FileType.IMAGE_PNG,
    FileType.IMAGE_GIF,
    FileType.IMAGE_WEBP,
];

/** Document file types supported by LLM providers */
export const DOCUMENT_FILE_TYPES: FileType[] = [
    FileType.PDF,
];

/** Text file types supported by LLM providers */
export const TEXT_FILE_TYPES: FileType[] = [
    FileType.TEXT_PLAIN,
    FileType.TEXT_CSV,
    FileType.TEXT_HTML,
    FileType.TEXT_MARKDOWN,
];

/** All supported file types */
export const ALL_FILE_TYPES: FileType[] = [
    ...IMAGE_FILE_TYPES,
    ...DOCUMENT_FILE_TYPES,
    ...TEXT_FILE_TYPES,
];

/**
 * Mapping of MIME types to file extensions (for client upload validation)
 */
export const FILE_TYPE_EXTENSIONS: Record<FileType, string[]> = {
    [FileType.IMAGE_JPEG]: ['.jpg', '.jpeg'],
    [FileType.IMAGE_PNG]: ['.png'],
    [FileType.IMAGE_GIF]: ['.gif'],
    [FileType.IMAGE_WEBP]: ['.webp'],
    [FileType.PDF]: ['.pdf'],
    [FileType.TEXT_PLAIN]: ['.txt'],
    [FileType.TEXT_CSV]: ['.csv'],
    [FileType.TEXT_HTML]: ['.html', '.htm'],
    [FileType.TEXT_MARKDOWN]: ['.md', '.markdown'],
};

/**
 * Get accepted file types as a record for client upload components
 * @param fileTypes - Array of FileType values to include
 * @returns Record of MIME type to extensions
 */
export function getAcceptedTypesRecord(fileTypes: FileType[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const type of fileTypes) {
        result[type] = FILE_TYPE_EXTENSIONS[type];
    }
    return result;
}

// ============================================================================
// Type Aliases (for provider-specific type requirements)
// ============================================================================

/** Type alias for image MIME types (used by providers like Anthropic that require specific type unions) */
export type ImageMediaType =
    | typeof FileType.IMAGE_JPEG
    | typeof FileType.IMAGE_PNG
    | typeof FileType.IMAGE_GIF
    | typeof FileType.IMAGE_WEBP;

/**
 * Parsed file data from a data URL
 */
export interface ParsedFileData {
    /** The file content category */
    category: FileContentCategory;
    /** The MIME type of the file */
    mimeType: string;
    /** The base64-encoded content (without the data URL prefix) */
    base64Data: string;
    /** For text files, the decoded text content */
    textContent?: string;
}

/**
 * Utility class for file type handling in LLM providers
 */
export class FileUtils {
    /**
     * Check if a MIME type is an image type
     */
    static isImageType(mimeType: string): boolean {
        return IMAGE_FILE_TYPES.includes(mimeType as FileType);
    }

    /**
     * Check if a MIME type is a document type (PDF)
     */
    static isDocumentType(mimeType: string): boolean {
        return DOCUMENT_FILE_TYPES.includes(mimeType as FileType);
    }

    /**
     * Check if a MIME type is a text type
     */
    static isTextType(mimeType: string): boolean {
        return TEXT_FILE_TYPES.includes(mimeType as FileType);
    }

    /**
     * Check if a MIME type is supported
     */
    static isSupportedType(mimeType: string): boolean {
        return ALL_FILE_TYPES.includes(mimeType as FileType);
    }

    /**
     * Get the content category for a MIME type
     */
    static getContentCategory(mimeType: string): FileContentCategory | null {
        if (this.isImageType(mimeType)) return FileContentCategory.IMAGE;
        if (this.isDocumentType(mimeType)) return FileContentCategory.DOCUMENT;
        if (this.isTextType(mimeType)) return FileContentCategory.TEXT;
        return null;
    }

    /**
     * Decode base64 text content to UTF-8 string
     */
    static decodeBase64Text(base64Data: string): string {
        return Buffer.from(base64Data, 'base64').toString('utf-8');
    }

    /**
     * Parse a data URL and extract file information
     */
    static parseDataUrl(dataUrl: string): ParsedFileData | null {
        if (!dataUrl.startsWith('data:')) {
            return null;
        }

        const [mediaTypeSection, base64Data] = dataUrl.split(',');
        if (!base64Data) {
            return null;
        }

        const mimeType = mediaTypeSection.split(':')[1]?.split(';')[0];
        if (!mimeType) {
            return null;
        }

        const category = this.getContentCategory(mimeType);
        if (!category) {
            return null;
        }

        const result: ParsedFileData = {
            category,
            mimeType,
            base64Data,
        };

        // For text files, also decode the content
        if (category === FileContentCategory.TEXT) {
            result.textContent = this.decodeBase64Text(base64Data);
        }

        return result;
    }

    /**
     * Get a list of all supported file types
     */
    static getSupportedTypes(): string[] {
        return [...ALL_FILE_TYPES];
    }

    /**
     * Get a formatted error message for unsupported file types
     */
    static getUnsupportedTypeError(mimeType: string): string {
        return `Unsupported file media type: ${mimeType}. Supported types: ${this.getSupportedTypes().join(', ')}`;
    }

    private static readonly FILE_TYPE_LABELS: Record<string, string> = {
        [FileType.PDF]: 'PDF',
        [FileType.IMAGE_JPEG]: 'JPEG',
        [FileType.IMAGE_PNG]: 'PNG',
        [FileType.IMAGE_WEBP]: 'WebP',
        [FileType.IMAGE_GIF]: 'GIF',
        [FileType.TEXT_PLAIN]: 'TXT',
        [FileType.TEXT_CSV]: 'CSV',
        [FileType.TEXT_HTML]: 'HTML',
        [FileType.TEXT_MARKDOWN]: 'Markdown',
    };

    /**
     * Get a human-readable label for a MIME type (e.g. "PDF", "JPEG", "PNG")
     */
    static getFileTypeLabel(mimeType: string): string {
        return this.FILE_TYPE_LABELS[mimeType]
            ?? mimeType.split('/')[1]?.toUpperCase()
            ?? 'FILE';
    }
}
