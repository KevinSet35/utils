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
    // Video
    VIDEO_MP4 = 'video/mp4',
    VIDEO_WEBM = 'video/webm',
    // Audio
    AUDIO_MPEG = 'audio/mpeg',
    AUDIO_WAV = 'audio/wav',
}

/**
 * File content categories for LLM processing
 */
export enum FileContentCategory {
    IMAGE = 'image',
    DOCUMENT = 'document',
    TEXT = 'text',
}

/**
 * Media content categories (superset of FileContentCategory, includes video/audio)
 */
export enum MediaCategory {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    TEXT = 'text',
}

/**
 * Storage subdirectory names for organizing output files by media type
 */
export type StorageSubdirectory = 'images' | 'videos' | 'audio' | 'files';

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

/** All supported file types (for LLM providers — images, documents, text) */
export const ALL_FILE_TYPES: FileType[] = [
    ...IMAGE_FILE_TYPES,
    ...DOCUMENT_FILE_TYPES,
    ...TEXT_FILE_TYPES,
];

/** Video file types */
export const VIDEO_FILE_TYPES: FileType[] = [
    FileType.VIDEO_MP4,
    FileType.VIDEO_WEBM,
];

/** Audio file types */
export const AUDIO_FILE_TYPES: FileType[] = [
    FileType.AUDIO_MPEG,
    FileType.AUDIO_WAV,
];

/** All media file types (images, video, audio, documents, text) */
export const ALL_MEDIA_FILE_TYPES: FileType[] = [
    ...IMAGE_FILE_TYPES,
    ...VIDEO_FILE_TYPES,
    ...AUDIO_FILE_TYPES,
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
    [FileType.VIDEO_MP4]: ['.mp4'],
    [FileType.VIDEO_WEBM]: ['.webm'],
    [FileType.AUDIO_MPEG]: ['.mp3'],
    [FileType.AUDIO_WAV]: ['.wav'],
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
// Extension ↔ MIME Type Mappings
// ============================================================================

/**
 * Comprehensive extension-to-MIME-type map.
 * Covers all media types used across the pipeline (images, video, audio, documents, text).
 */
export const EXTENSION_TO_MIME: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
};

/**
 * MIME-type-to-primary-extension map (first/canonical extension for each MIME type).
 */
export const MIME_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'text/html': '.html',
    'text/markdown': '.md',
};

/**
 * Maps a file extension to a storage subdirectory name.
 */
export const EXTENSION_TO_SUBDIRECTORY: Record<string, StorageSubdirectory> = {
    '.jpg': 'images',
    '.jpeg': 'images',
    '.png': 'images',
    '.gif': 'images',
    '.webp': 'images',
    '.mp4': 'videos',
    '.webm': 'videos',
    '.mp3': 'audio',
    '.wav': 'audio',
};

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
     * Check if a MIME type is a video type
     */
    static isVideoType(mimeType: string): boolean {
        return VIDEO_FILE_TYPES.includes(mimeType as FileType);
    }

    /**
     * Check if a MIME type is an audio type
     */
    static isAudioType(mimeType: string): boolean {
        return AUDIO_FILE_TYPES.includes(mimeType as FileType);
    }

    /**
     * Check if a MIME type is any known media type (image, video, audio, document, text)
     */
    static isKnownMediaType(mimeType: string): boolean {
        return ALL_MEDIA_FILE_TYPES.includes(mimeType as FileType);
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
     * Get the media category for a MIME type (includes video/audio)
     */
    static getMediaCategory(mimeType: string): MediaCategory | null {
        if (this.isImageType(mimeType)) return MediaCategory.IMAGE;
        if (this.isVideoType(mimeType)) return MediaCategory.VIDEO;
        if (this.isAudioType(mimeType)) return MediaCategory.AUDIO;
        if (this.isDocumentType(mimeType)) return MediaCategory.DOCUMENT;
        if (this.isTextType(mimeType)) return MediaCategory.TEXT;
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
        [FileType.VIDEO_MP4]: 'MP4',
        [FileType.VIDEO_WEBM]: 'WebM',
        [FileType.AUDIO_MPEG]: 'MP3',
        [FileType.AUDIO_WAV]: 'WAV',
    };

    /**
     * Get a human-readable label for a MIME type (e.g. "PDF", "JPEG", "PNG")
     */
    static getFileTypeLabel(mimeType: string): string {
        return this.FILE_TYPE_LABELS[mimeType]
            ?? mimeType.split('/')[1]?.toUpperCase()
            ?? 'FILE';
    }

    // ========================================================================
    // Extension / MIME helpers (replaces hardcoded maps in server services)
    // ========================================================================

    /**
     * Get the MIME type for a file extension (e.g. '.png' -> 'image/png').
     * Returns 'application/octet-stream' for unknown extensions.
     */
    static getMimeTypeFromExtension(ext: string): string {
        return EXTENSION_TO_MIME[ext.toLowerCase()] ?? 'application/octet-stream';
    }

    /**
     * Get the MIME type for a file path by extracting its extension.
     * Returns 'application/octet-stream' for unknown extensions.
     */
    static getMimeTypeFromPath(filePath: string): string {
        const ext = FileUtils.extractExtension(filePath);
        return ext ? FileUtils.getMimeTypeFromExtension(ext) : 'application/octet-stream';
    }

    /**
     * Get the canonical file extension for a MIME type (e.g. 'image/jpeg' -> '.jpg').
     * Returns null for unknown MIME types.
     */
    static getExtensionFromMimeType(mimeType: string): string | null {
        return MIME_TO_EXTENSION[mimeType] ?? null;
    }

    /**
     * Get the storage subdirectory name for a file extension.
     * Maps image extensions to 'images', video to 'videos', audio to 'audio',
     * and everything else to 'files'.
     */
    static getStorageSubdirectory(ext: string): StorageSubdirectory {
        return EXTENSION_TO_SUBDIRECTORY[ext.toLowerCase()] ?? 'files';
    }

    /**
     * Get the storage subdirectory name for a file path.
     */
    static getStorageSubdirectoryFromPath(filePath: string): StorageSubdirectory {
        const ext = FileUtils.extractExtension(filePath);
        return ext ? FileUtils.getStorageSubdirectory(ext) : 'files';
    }

    // ========================================================================
    // Path helpers
    // ========================================================================

    /**
     * Extract the file extension from a path (including the dot, lowercased).
     * Returns null if no extension found.
     */
    static extractExtension(filePath: string): string | null {
        const dotIndex = filePath.lastIndexOf('.');
        if (dotIndex === -1 || dotIndex === filePath.length - 1) return null;
        // Handle paths with directory separators after the dot
        const afterDot = filePath.substring(dotIndex);
        if (afterDot.includes('/') || afterDot.includes('\\')) return null;
        return afterDot.toLowerCase();
    }

    /**
     * Extract the filename (basename) from a file path.
     * Works with both forward slashes and backslashes.
     */
    static extractFilename(filePath: string): string {
        const normalized = filePath.replace(/\\/g, '/');
        const lastSlash = normalized.lastIndexOf('/');
        return lastSlash === -1 ? filePath : filePath.substring(lastSlash + 1);
    }

    /**
     * Convert an absolute file path to a URL-style output path.
     * e.g. '/Users/.../outputs/images/file.png' with outputDir '/Users/.../outputs'
     *   -> '/outputs/images/file.png'
     */
    static toOutputUrl(filePath: string, outputDir: string): string {
        // Normalize both paths for comparison
        const normalizedFile = filePath.replace(/\\/g, '/');
        const normalizedDir = outputDir.replace(/\\/g, '/').replace(/\/$/, '');
        const relative = normalizedFile.startsWith(normalizedDir + '/')
            ? normalizedFile.substring(normalizedDir.length)
            : '/' + FileUtils.extractFilename(filePath);
        return `/outputs${relative}`;
    }

    /**
     * Convert a URL-style output path to an absolute filesystem path.
     * e.g. '/outputs/images/file.png' with outputDir '/Users/.../outputs'
     *   -> '/Users/.../outputs/images/file.png'
     */
    static fromOutputUrl(urlPath: string, outputDir: string): string {
        const relative = urlPath.replace(/^\/outputs\//, '');
        const normalizedDir = outputDir.replace(/\\/g, '/').replace(/\/$/, '');
        return `${normalizedDir}/${relative}`;
    }

    /**
     * Build a storage object key from a file path.
     * e.g. '/path/to/image.png' -> 'images/image.png'
     */
    static buildStorageKey(filePath: string): string {
        const subdir = FileUtils.getStorageSubdirectoryFromPath(filePath);
        const filename = FileUtils.extractFilename(filePath);
        return `${subdir}/${filename}`;
    }

    /**
     * Build a namespaced storage key for a generation run.
     * e.g. buildGenerationKey('run-123', 'source_image', 'photo.png')
     *   -> 'generations/run-123/source_image/photo.png'
     */
    static buildGenerationKey(runId: string, assetRole: string, filename: string): string {
        return `generations/${runId}/${assetRole}/${filename}`;
    }

    /**
     * Build an output file path from outputDir, subdirectory, and filename.
     * e.g. buildOutputPath('/app/outputs', 'images', 'abc.png')
     *   -> '/app/outputs/images/abc.png'
     */
    static buildOutputPath(outputDir: string, subdirectory: string, filename: string): string {
        const normalizedDir = outputDir.replace(/\\/g, '/').replace(/\/$/, '');
        return `${normalizedDir}/${subdirectory}/${filename}`;
    }
}
