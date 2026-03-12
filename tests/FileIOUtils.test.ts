import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FileIOUtils } from '../src/FileIOUtils.js';

const TEST_DIR = path.join(os.tmpdir(), 'fileioutils-test-' + Date.now());

beforeEach(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('FileIOUtils - directory helpers', () => {
    describe('ensureDirSync', () => {
        it('creates a directory that does not exist', () => {
            const dir = path.join(TEST_DIR, 'a', 'b', 'c');
            FileIOUtils.ensureDirSync(dir);
            expect(fs.existsSync(dir)).toBe(true);
        });

        it('does not throw if directory already exists', () => {
            FileIOUtils.ensureDirSync(TEST_DIR);
            expect(fs.existsSync(TEST_DIR)).toBe(true);
        });
    });

    describe('ensureDir', () => {
        it('creates a directory that does not exist (async)', async () => {
            const dir = path.join(TEST_DIR, 'async', 'nested');
            await FileIOUtils.ensureDir(dir);
            expect(fs.existsSync(dir)).toBe(true);
        });
    });

    describe('ensureParentDirSync', () => {
        it('creates the parent directory for a file path', () => {
            const filePath = path.join(TEST_DIR, 'parent', 'file.txt');
            FileIOUtils.ensureParentDirSync(filePath);
            expect(fs.existsSync(path.join(TEST_DIR, 'parent'))).toBe(true);
        });
    });
});

describe('FileIOUtils - read/write helpers', () => {
    const testContent = Buffer.from('hello world');

    describe('writeBufferSync / readFileToBufferSync', () => {
        it('writes and reads a buffer', () => {
            const filePath = path.join(TEST_DIR, 'test.txt');
            FileIOUtils.writeBufferSync(filePath, testContent);
            const result = FileIOUtils.readFileToBufferSync(filePath);
            expect(result.equals(testContent)).toBe(true);
        });

        it('creates parent directories', () => {
            const filePath = path.join(TEST_DIR, 'deep', 'nested', 'test.txt');
            FileIOUtils.writeBufferSync(filePath, testContent);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });

    describe('writeBuffer / readFileToBuffer', () => {
        it('writes and reads a buffer (async)', async () => {
            const filePath = path.join(TEST_DIR, 'async-test.txt');
            await FileIOUtils.writeBuffer(filePath, testContent);
            const result = await FileIOUtils.readFileToBuffer(filePath);
            expect(result.equals(testContent)).toBe(true);
        });
    });

    describe('copyFileSync', () => {
        it('copies a file', () => {
            const src = path.join(TEST_DIR, 'src.txt');
            const dest = path.join(TEST_DIR, 'copy', 'dest.txt');
            fs.writeFileSync(src, testContent);
            FileIOUtils.copyFileSync(src, dest);
            expect(fs.readFileSync(dest).equals(testContent)).toBe(true);
        });
    });
});

describe('FileIOUtils - file metadata', () => {
    describe('getFileSize', () => {
        it('returns file size', async () => {
            const filePath = path.join(TEST_DIR, 'sized.txt');
            const content = Buffer.from('12345');
            fs.writeFileSync(filePath, content);
            expect(await FileIOUtils.getFileSize(filePath)).toBe(5);
        });

        it('returns null for non-existent file', async () => {
            expect(await FileIOUtils.getFileSize('/does/not/exist')).toBeNull();
        });
    });

    describe('fileExists / fileExistsSync', () => {
        it('returns true for existing file', async () => {
            const filePath = path.join(TEST_DIR, 'exists.txt');
            fs.writeFileSync(filePath, 'hi');
            expect(await FileIOUtils.fileExists(filePath)).toBe(true);
            expect(FileIOUtils.fileExistsSync(filePath)).toBe(true);
        });

        it('returns false for non-existent file', async () => {
            expect(await FileIOUtils.fileExists('/does/not/exist')).toBe(false);
            expect(FileIOUtils.fileExistsSync('/does/not/exist')).toBe(false);
        });
    });
});

describe('FileIOUtils - checksum', () => {
    describe('computeChecksum', () => {
        it('computes SHA-256 by default', () => {
            const buffer = Buffer.from('test data');
            const hash = FileIOUtils.computeChecksum(buffer);
            expect(hash).toMatch(/^[a-f0-9]{64}$/);
        });

        it('returns consistent results', () => {
            const buffer = Buffer.from('deterministic');
            const a = FileIOUtils.computeChecksum(buffer);
            const b = FileIOUtils.computeChecksum(buffer);
            expect(a).toBe(b);
        });

        it('supports other algorithms', () => {
            const buffer = Buffer.from('test');
            const md5 = FileIOUtils.computeChecksum(buffer, 'md5');
            expect(md5).toMatch(/^[a-f0-9]{32}$/);
        });
    });

    describe('computeFileChecksum', () => {
        it('computes checksum of a file', async () => {
            const filePath = path.join(TEST_DIR, 'hashme.txt');
            const content = Buffer.from('hash this');
            fs.writeFileSync(filePath, content);
            const fileHash = await FileIOUtils.computeFileChecksum(filePath);
            const directHash = FileIOUtils.computeChecksum(content);
            expect(fileHash).toBe(directHash);
        });
    });
});

describe('FileIOUtils - data URI conversion', () => {
    describe('fileToDataUri', () => {
        it('converts a PNG file to data URI', () => {
            const filePath = path.join(TEST_DIR, 'test.png');
            const content = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
            fs.writeFileSync(filePath, content);
            const uri = FileIOUtils.fileToDataUri(filePath);
            expect(uri).toBe(`data:image/png;base64,${content.toString('base64')}`);
        });

        it('converts an MP4 file to data URI', () => {
            const filePath = path.join(TEST_DIR, 'test.mp4');
            const content = Buffer.from([0x00, 0x01, 0x02]);
            fs.writeFileSync(filePath, content);
            const uri = FileIOUtils.fileToDataUri(filePath);
            expect(uri).toMatch(/^data:video\/mp4;base64,/);
        });
    });

    describe('fileToDataUriAsync', () => {
        it('works async', async () => {
            const filePath = path.join(TEST_DIR, 'async.wav');
            const content = Buffer.from([0x52, 0x49, 0x46, 0x46]);
            fs.writeFileSync(filePath, content);
            const uri = await FileIOUtils.fileToDataUriAsync(filePath);
            expect(uri).toBe(`data:audio/wav;base64,${content.toString('base64')}`);
        });
    });
});

describe('FileIOUtils - resolveFileMetadata', () => {
    it('returns metadata for an existing file', async () => {
        const filePath = path.join(TEST_DIR, 'meta.png');
        const content = Buffer.from('image data here');
        fs.writeFileSync(filePath, content);
        const meta = await FileIOUtils.resolveFileMetadata(filePath);
        expect(meta).not.toBeNull();
        expect(meta!.filename).toBe('meta.png');
        expect(meta!.fileSize).toBe(content.length);
        expect(meta!.mimeType).toBe('image/png');
        expect(meta!.checksum).toMatch(/^[a-f0-9]{64}$/);
    });

    it('returns null for non-existent file', async () => {
        const meta = await FileIOUtils.resolveFileMetadata('/does/not/exist.png');
        expect(meta).toBeNull();
    });
});
