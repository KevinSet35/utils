import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as crypto from 'crypto';
import { FileUtils } from './FileUtils.js';

/**
 * Result of downloading a file to the output directory.
 */
export interface DownloadResult {
    /** Absolute path where the file was saved */
    filePath: string;
    /** Raw file contents */
    buffer: Buffer;
}

/**
 * Resolved metadata for a local file on disk.
 */
export interface FileMetadata {
    /** The filename (basename) extracted from the path */
    filename: string;
    /** File size in bytes */
    fileSize: number;
    /** MIME type inferred from the file extension */
    mimeType: string;
    /** SHA-256 hex digest of the file contents */
    checksum: string;
}

/**
 * Node.js file I/O utilities.
 *
 * These require a Node.js runtime (they use fs, crypto, etc.).
 * For pure/browser-safe utilities, use FileUtils instead.
 */
export class FileIOUtils {
    // ========================================================================
    // Directory helpers
    // ========================================================================

    /**
     * Ensure a directory exists, creating it (and parents) if necessary.
     * Synchronous — mirrors the pattern used across all providers.
     */
    static ensureDirSync(dirPath: string): void {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    /**
     * Ensure a directory exists, creating it (and parents) if necessary.
     * Async variant.
     */
    static async ensureDir(dirPath: string): Promise<void> {
        await fsp.mkdir(dirPath, { recursive: true });
    }

    /**
     * Ensure the parent directory for a given file path exists.
     */
    static ensureParentDirSync(filePath: string): void {
        const dir = filePath.substring(0, filePath.lastIndexOf('/'));
        if (dir) {
            FileIOUtils.ensureDirSync(dir);
        }
    }

    // ========================================================================
    // Read / Write helpers
    // ========================================================================

    /**
     * Read a file into a Buffer (async).
     */
    static async readFileToBuffer(filePath: string): Promise<Buffer> {
        return fsp.readFile(filePath);
    }

    /**
     * Read a file into a Buffer (sync).
     */
    static readFileToBufferSync(filePath: string): Buffer {
        return fs.readFileSync(filePath);
    }

    /**
     * Write a Buffer to a file (sync). Creates parent directories if needed.
     */
    static writeBufferSync(filePath: string, buffer: Buffer): void {
        FileIOUtils.ensureParentDirSync(filePath);
        fs.writeFileSync(filePath, buffer);
    }

    /**
     * Write a Buffer to a file (async). Creates parent directories if needed.
     */
    static async writeBuffer(filePath: string, buffer: Buffer): Promise<void> {
        const dir = filePath.substring(0, filePath.lastIndexOf('/'));
        if (dir) {
            await FileIOUtils.ensureDir(dir);
        }
        await fsp.writeFile(filePath, buffer);
    }

    /**
     * Copy a file from source to destination (sync).
     */
    static copyFileSync(src: string, dest: string): void {
        FileIOUtils.ensureParentDirSync(dest);
        fs.copyFileSync(src, dest);
    }

    // ========================================================================
    // File metadata
    // ========================================================================

    /**
     * Get file size in bytes. Returns null if file doesn't exist.
     */
    static async getFileSize(filePath: string): Promise<number | null> {
        try {
            const stat = await fsp.stat(filePath);
            return stat.size;
        } catch {
            return null;
        }
    }

    /**
     * Check if a file exists.
     */
    static async fileExists(filePath: string): Promise<boolean> {
        try {
            await fsp.stat(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if a file exists (sync).
     */
    static fileExistsSync(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    // ========================================================================
    // Checksum / Hashing
    // ========================================================================

    /**
     * Compute a SHA-256 hex digest for a Buffer.
     */
    static computeChecksum(buffer: Buffer, algorithm: string = 'sha256'): string {
        return crypto.createHash(algorithm).update(buffer).digest('hex');
    }

    /**
     * Read a file and compute its SHA-256 hex digest.
     */
    static async computeFileChecksum(
        filePath: string,
        algorithm: string = 'sha256',
    ): Promise<string> {
        const buffer = await fsp.readFile(filePath);
        return FileIOUtils.computeChecksum(buffer, algorithm);
    }

    // ========================================================================
    // Data URI conversion
    // ========================================================================

    /**
     * Read a file and return it as a base64 data URI string.
     * e.g. 'data:image/png;base64,iVBOR...'
     */
    static fileToDataUri(filePath: string): string {
        const buffer = fs.readFileSync(filePath);
        const mimeType = FileUtils.getMimeTypeFromPath(filePath);
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    /**
     * Read a file and return it as a base64 data URI string (async).
     */
    static async fileToDataUriAsync(filePath: string): Promise<string> {
        const buffer = await fsp.readFile(filePath);
        const mimeType = FileUtils.getMimeTypeFromPath(filePath);
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    // ========================================================================
    // Download helpers
    // ========================================================================

    /**
     * Download a file from a URL and save it to disk.
     * Returns the Buffer of the downloaded content.
     */
    static async downloadToFile(url: string, filePath: string): Promise<Buffer> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download from ${url}: ${response.statusText}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        FileIOUtils.ensureParentDirSync(filePath);
        fs.writeFileSync(filePath, buffer);
        return buffer;
    }

    /**
     * Download a file from a URL to an auto-generated path in the given output directory.
     * Uses the appropriate subdirectory based on the file extension.
     * Returns { filePath, buffer }.
     */
    static async downloadToOutputDir(
        url: string,
        outputDir: string,
        filename: string,
    ): Promise<DownloadResult> {
        const ext = FileUtils.extractExtension(filename);
        const subdir = ext ? FileUtils.getStorageSubdirectory(ext) : 'files';
        const dir = `${outputDir.replace(/\/$/, '')}/${subdir}`;
        FileIOUtils.ensureDirSync(dir);
        const filePath = `${dir}/${filename}`;
        const buffer = await FileIOUtils.downloadToFile(url, filePath);
        return { filePath, buffer };
    }

    // ========================================================================
    // Composite: resolve local asset metadata
    // ========================================================================

    /**
     * Resolve metadata for a local file: size, MIME type, and checksum.
     * Returns null if the file doesn't exist.
     */
    static async resolveFileMetadata(filePath: string): Promise<FileMetadata | null> {
        try {
            const stat = await fsp.stat(filePath);
            const buffer = await fsp.readFile(filePath);
            const checksum = FileIOUtils.computeChecksum(buffer);
            return {
                filename: FileUtils.extractFilename(filePath),
                fileSize: stat.size,
                mimeType: FileUtils.getMimeTypeFromPath(filePath),
                checksum,
            };
        } catch {
            return null;
        }
    }
}
